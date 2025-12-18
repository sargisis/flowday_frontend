import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../api/tasks";
import { useProject } from "../context/ProjectContext";

export default function CreateTaskPage() {
    const navigate = useNavigate();
    const { activeProjectId } = useProject();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !activeProjectId) return;

        setIsLoading(true);
        try {
            await createTask({
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                project_id: activeProjectId,
            });

            navigate("/app/v1/tasks");
        } catch (error) {
            alert("Failed to create task");
        } finally {
            setIsLoading(false);
        }
    };

    if (!activeProjectId) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>Select a project first</p>
            </div>
        );
    }

    return (
        <>
            <header style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "0.2rem" }}>Create New Task</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Add a new task to your project
                </p>
            </header>

            <div className="card" style={{ maxWidth: "700px" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Task Name */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: "var(--text-main)"
                        }}>
                            Task Name <span style={{ color: "#e74c3c" }}>*</span>
                        </label>
                        <input
                            autoFocus
                            className="input-field"
                            placeholder="Enter task name..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: "var(--text-main)"
                        }}>
                            Description
                        </label>
                        <textarea
                            className="input-field"
                            placeholder="Describe the task in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={6}
                            style={{
                                width: "100%",
                                resize: "vertical",
                                minHeight: "150px",
                                fontFamily: "inherit",
                                fontSize: "0.95rem",
                                lineHeight: 1.6
                            }}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.75rem",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: "var(--text-main)"
                        }}>
                            Priority
                        </label>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            {[
                                { value: "low", label: "Low", color: "#71717a" },
                                { value: "medium", label: "Medium", color: "#0ea5e9" },
                                { value: "high", label: "High", color: "#e74c3c" }
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPriority(p.value)}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: "1rem",
                                        borderRadius: "var(--radius-md)",
                                        border: `2px solid ${priority === p.value ? p.color : "var(--border)"}`,
                                        background: priority === p.value ? `${p.color}15` : "transparent",
                                        color: priority === p.value ? p.color : "var(--text-muted)",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseOver={(e) => {
                                        if (priority !== p.value) {
                                            e.currentTarget.style.borderColor = p.color + "80";
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (priority !== p.value) {
                                            e.currentTarget.style.borderColor = "var(--border)";
                                        }
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "1rem",
                        paddingTop: "1.5rem",
                        borderTop: "1px solid var(--border)"
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate("/app/v1/tasks")}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: "0.875rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontWeight: 500,
                                fontSize: "0.95rem",
                                transition: "all 0.2s"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="btn"
                            style={{
                                flex: 2,
                                padding: "0.875rem",
                                fontSize: "0.95rem",
                                opacity: isLoading || !title.trim() ? 0.5 : 1,
                                cursor: isLoading || !title.trim() ? "not-allowed" : "pointer"
                            }}
                        >
                            {isLoading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
