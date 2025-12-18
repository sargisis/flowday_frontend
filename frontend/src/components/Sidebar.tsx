import { useState } from "react";
import { NavLink } from "react-router-dom";
import { createProject } from "../api/projects";
import { useProject } from "../context/ProjectContext";

export default function Sidebar() {
    const { projects, activeProjectId, setActiveProjectId, refreshProjects } = useProject();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

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
        { label: "Dashboard", path: "/app/v1/dashboard" },
        { label: "Tasks", path: "/app/v1/tasks" },
        { label: "Team", path: "/app/v1/team" },
        { label: "Invitations", path: "/app/v1/invitations" },
        { label: "Settings", path: "/app/v1/settings" },
    ];

    return (
        <aside className="card" style={{ width: 260, height: "calc(100vh - var(--space-lg) * 2)", display: "flex", flexDirection: "column", padding: "var(--space-md)", position: "sticky", top: "var(--space-lg)" }}>
            {/* Brand Header */}
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--primary)" }}>✦</span> flowday
            </h1>

            {/* Main Navigation */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => (isActive ? "active-nav" : "")}
                        style={({ isActive }) => ({
                            textDecoration: "none",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "var(--radius-md)",
                            color: isActive ? "var(--text-main)" : "var(--text-muted)",
                            background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                            fontWeight: isActive ? 600 : 400,
                            display: "flex",
                            alignItems: "center",
                            transition: "all 0.2s"
                        })}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Projects List */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>
                    Projects
                </h4>

                {projects.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => setActiveProjectId(p.id)}
                        style={{
                            cursor: "pointer",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "var(--radius-md)",
                            background: p.id === activeProjectId ? "var(--bg-card-hover)" : "transparent",
                            color: p.id === activeProjectId ? "var(--text-main)" : "var(--text-muted)",
                            fontWeight: p.id === activeProjectId ? 500 : 400,
                            fontSize: "0.9rem",
                            border: `1px solid ${p.id === activeProjectId ? "var(--border-active)" : "transparent"}`,
                            transition: "all 0.15s"
                        }}
                    >
                        {p.name}
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
                        style={{
                            marginTop: "0.5rem",
                            background: "transparent",
                            border: "1px dashed var(--border)",
                            color: "var(--text-muted)",
                            padding: "0.6rem",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "0.85rem",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        + Create New Project
                    </button>
                )}
            </div>
        </aside>
    );
}
