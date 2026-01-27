import { useState, useEffect, memo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { createProject, updateProject, deleteProject } from "../api/projects";
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
    X,
    MoreVertical,
    Pencil,
    Trash2,
    Check
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

    // Renaming state
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Context menu state (simple version: show options on hover/click)
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Request permission on load
        import("../utils/notificationManager").then(({ notificationManager }) => {
            if (!notificationManager.canNotify()) {
                setPermissionGranted(false);
            } else {
                setPermissionGranted(true);
            }
        });

        // Background poller for due tasks (kept as is)
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

                    if (diffMins > 55 && diffMins < 65) {
                        const key = `notified-due-${t.id}`;
                        if (!localStorage.getItem(key)) {
                            notificationManager.notifyTaskDue(t.title, "in 1 hour");
                            localStorage.setItem(key, "true");
                        }
                    }

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

        const interval = setInterval(checkDueTasks, 60000);
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

    const startEditing = (project: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProjectId(project.id);
        setEditName(project.name);
        setMenuOpenId(null);
    };

    const saveRename = async (projectId: string) => {
        if (!editName.trim()) return;
        try {
            await updateProject(projectId, editName);
            await refreshProjects();
            setEditingProjectId(null);
            toast.success("Project renamed");
        } catch (error) {
            toast.error("Failed to rename project");
        }
    };

    const handleDelete = async (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? All tasks will be lost.")) return;
        try {
            await deleteProject(projectId);
            await refreshProjects();
            if (activeProjectId === projectId) setActiveProjectId(null);
            toast.success("Project deleted");
        } catch (error) {
            toast.error("Failed to delete project");
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

            <aside className={`sidebar-container dark:bg-black ${isMobileOpen ? 'mobile-open' : ''}`}>
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
                            onClick={() => !editingProjectId && setActiveProjectId(p.id)}
                            className={`project-item group relative ${p.id === activeProjectId ? "active-project" : ""} `}
                        >
                            <div className="project-color-dot" />

                            {editingProjectId === p.id ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <input
                                        autoFocus
                                        className="bg-transparent border-b border-blue-500 text-sm text-white w-full outline-none p-0"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveRename(p.id);
                                            if (e.key === 'Escape') setEditingProjectId(null);
                                        }}
                                        onBlur={() => setEditingProjectId(null)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {p.name}
                                    </span>

                                    {/* Action Buttons */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 p-0.5 rounded-md">
                                        <button
                                            onClick={(e) => startEditing(p, e)}
                                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded"
                                            title="Rename"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(p.id, e)}
                                            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </>
                            )}
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
