import { useState, useEffect, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { createProject } from "../api/projects";
import { useProject } from "../context/ProjectContext";
import { toast } from "sonner";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Mail,
    Settings,
    Plus,
    Calendar,
    Hexagon,
    Bell,
    MessageSquare,
    BarChart3,
    Menu,
    X
} from "lucide-react";

// Prefetch routes on hover for faster navigation
import { prefetchRoute as prefetchRouteUtil } from '../utils/prefetch';

const prefetchRoute = (path: string) => {
    prefetchRouteUtil(path);
};

function Sidebar() {
    const { projects, activeProjectId, setActiveProjectId, refreshProjects } = useProject();
    const location = useLocation();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        // Request permission on load
        import("../utils/notificationManager").then(({ notificationManager }) => {
            if (!notificationManager.canNotify()) {
                // Don't auto-spam, maybe show a toast or banner later
                // For now, we'll try silently or check permission
                setPermissionGranted(false);
            } else {
                setPermissionGranted(true);
            }
        });

        // Background poller for due tasks
        const checkDueTasks = async () => {
            const { notificationManager } = await import("../utils/notificationManager");
            const { getTasksByProject } = await import("../api/tasks");

            if (!notificationManager.canNotify() || !activeProjectId) return;

            try {
                const tasks = await getTasksByProject(activeProjectId);
                const now = new Date();

                tasks.forEach(t => {
                    if (t.status.toLowerCase() === 'done' || !t.due_date) return;

                    const due = new Date(t.due_date);
                    const diffMs = due.getTime() - now.getTime();
                    const diffMins = diffMs / (1000 * 60);

                    // Notify if due in exactly ~1 hour (window of 5 mins)
                    if (diffMins > 55 && diffMins < 65) {
                        // Check if already notified using localStorage to avoid spam
                        const key = `notified-due-${t.id}`;
                        if (!localStorage.getItem(key)) {
                            notificationManager.notifyTaskDue(t.title, "in 1 hour");
                            localStorage.setItem(key, "true");
                        }
                    }

                    // Notify if overdue recently (window of 5 mins ago)
                    if (diffMins < 0 && diffMins > -5) {
                        const key = `notified-overdue-${t.id}`;
                        if (!localStorage.getItem(key)) {
                            notificationManager.notifyTaskOverdue(t.title);
                            localStorage.setItem(key, "true");
                        }
                    }
                });
            } catch (e) {
                console.error("Bg check failed", e);
            }
        };

        const interval = setInterval(checkDueTasks, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [activeProjectId]);
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        try {
            await createProject(newProjectName);
            await refreshProjects();
            setNewProjectName("");
            setIsCreating(false);
            toast.success("Project created successfully");
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/app/v1/dashboard", icon: LayoutDashboard },
        { label: "Calendar", path: "/app/v1/calendar", icon: Calendar },
        { label: "My Tasks", path: "/app/v1/tasks", icon: CheckSquare },
        { label: "Analytics", path: "/app/v1/analytics", icon: BarChart3 },
        { label: "Messages", path: "/app/v1/messages", icon: MessageSquare },
        { label: "Team", path: "/app/v1/team", icon: Users },
        { label: "Invitations", path: "/app/v1/invitations", icon: Mail },
        { label: "Settings", path: "/app/v1/settings", icon: Settings },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition-all shadow-lg"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Brand Header */}
                <div className="app-logo">
                    <Hexagon className="logo-icon logo-animate" size={24} strokeWidth={2.5} />
                    <span>Flowday</span>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden ml-auto p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

            {/* Main Navigation */}
            <h4 className="nav-section-title">Menu</h4>
            <nav style={{ display: "flex", flexDirection: "column" }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onMouseEnter={() => prefetchRoute(item.path)}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active-nav" : ""} `
                        }
                    >
                        <item.icon className="nav-icon" />
                        <span>{item.label}</span>
                        {(item as any).badge ? (
                            <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {(item as any).badge}
                            </span>
                        ) : null}
                    </NavLink>
                ))}
            </nav>

            {/* Projects List */}
            <div className="project-list">
                <h4 className="nav-section-title" style={{ marginTop: "1.5rem" }}>
                    Projects
                </h4>

                {projects.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => setActiveProjectId(p.id)}
                        className={`project-item ${p.id === activeProjectId ? "active-project" : ""} `}
                    >
                        <div className="project-color-dot" />
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.name}
                        </span>
                    </div>
                ))}

                {!permissionGranted && (
                    <div className="mt-8 px-4 pb-4">
                        <button
                            onClick={async () => {
                                const { notificationManager } = await import("../utils/notificationManager");
                                const granted = await notificationManager.requestPermission();
                                setPermissionGranted(granted);
                            }}
                            className="w-full text-xs text-zinc-500 hover:text-indigo-400 flex items-center justify-center gap-2 py-2 border border-dashed border-zinc-800 rounded-lg hover:bg-white/5 transition-all"
                        >
                            <Bell size={12} /> Enable Alerts
                        </button>
                    </div>
                )}

                {isCreating ? (
                    <form onSubmit={handleCreate} style={{ marginTop: "0.5rem" }}>
                        <input
                            autoFocus
                            className="input-field"
                            style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                            placeholder="Project name..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onBlur={() => !newProjectName && setIsCreating(false)}
                        />
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="create-project-btn"
                    >
                        <Plus size={16} />
                        <span>Create Project</span>
                    </button>
                )}
            </div>
        </aside>
        </>
    );
}

// Memoize Sidebar to prevent unnecessary re-renders
export default memo(Sidebar);
