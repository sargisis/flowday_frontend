import { useEffect, useState } from "react";
import { type Task, getTasksByProject, updateTask, deleteTask } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import CreateTaskForm from "../components/CreateTaskForm";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadTasks = () => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [activeProjectId]);

    const handleDelete = async (taskId: string) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(taskId);
                loadTasks();
            } catch {
                alert("Failed to delete task");
            }
        }
    };



    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'blocked': return 'var(--status-blocked)';
            case 'in_progress': return 'var(--status-progress)';
            case 'done': return 'var(--status-done)';
            case 'review': return 'var(--status-review)';
            default: return 'var(--status-todo)';
        }
    };

    if (!activeProjectId) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>Select a project to view tasks</p>
            </div>
        );
    }

    return (
        <>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ marginBottom: "0.2rem" }}>Tasks</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Manage and track your project tasks</p>
                </div>
            </header>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "var(--space-md)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>All Tasks</h3>
                    <CreateTaskForm />
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", textAlign: "left" }}>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Task</th>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Status</th>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Priority</th>
                                <th style={{ padding: "1rem", fontWeight: 500, width: "100px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(t => (
                                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                                            {t.description && (
                                                <div style={{
                                                    fontSize: "0.85rem",
                                                    color: "var(--text-muted)",
                                                    marginTop: "0.25rem",
                                                    lineHeight: 1.4
                                                }}>
                                                    {t.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <select
                                            value={t.status}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                try {
                                                    await updateTask(t.id, { status: newStatus });
                                                    loadTasks();
                                                } catch {
                                                    alert("Failed to update status");
                                                }
                                            }}
                                            style={{
                                                background: "transparent",
                                                border: "1px solid var(--border)",
                                                color: getStatusColor(t.status),
                                                padding: "0.3rem 0.5rem",
                                                borderRadius: "var(--radius-sm)",
                                                fontSize: "0.85rem",
                                                cursor: "pointer",
                                                fontWeight: 500,
                                                outline: "none"
                                            }}
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In_Progress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Blocked">Blocked</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{t.priority.toUpperCase()}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            style={{
                                                background: "#e74c3c",
                                                border: "none",
                                                color: "white",
                                                padding: "0.5rem 1rem",
                                                borderRadius: "8px",
                                                fontSize: "0.85rem",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                transition: "all 0.2s",
                                                boxShadow: "0 2px 8px rgba(231, 76, 60, 0.2)"
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = "#c0392b";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(231, 76, 60, 0.3)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = "#e74c3c";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(231, 76, 60, 0.2)";
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No tasks in this project</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
