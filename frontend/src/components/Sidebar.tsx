import { useState } from "react";
import { NavLink } from "react-router-dom";
import { createProject } from "../api/projects";
import { useProject } from "../context/ProjectContext";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Mail,
    Settings,
    Plus,
    Calendar,
    Hexagon
} from "lucide-react";

export default function Sidebar() {
    const { projects, activeProjectId, setActiveProjectId, refreshProjects } = useProject();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    // Notifications logic moved to TopBar/NotificationsPage
    // Keeping this clean for future features

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        try {
            await createProject(newProjectName);
            await refreshProjects();
            setNewProjectName("");
            setIsCreating(false);
        } catch (error) {
            alert("Failed to create project");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/app/v1/dashboard", icon: LayoutDashboard },
        { label: "Calendar", path: "/app/v1/calendar", icon: Calendar },
        { label: "My Tasks", path: "/app/v1/tasks", icon: CheckSquare },
        { label: "Team", path: "/app/v1/team", icon: Users },
        { label: "Invitations", path: "/app/v1/invitations", icon: Mail },
        { label: "Settings", path: "/app/v1/settings", icon: Settings },
    ];

    return (
        <aside className="sidebar-container">
            {/* Brand Header */}
            <div className="app-logo">
                <Hexagon className="logo-icon" size={28} strokeWidth={2.5} />
                <span>Flowday</span>
            </div>

            {/* Main Navigation */}
            <h4 className="nav-section-title">Menu</h4>
            <nav style={{ display: "flex", flexDirection: "column" }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
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
    );
}
