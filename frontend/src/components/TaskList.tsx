import type { Task } from "../api/tasks";

export default function TaskList({ tasks }: { tasks: Task[] }) {
    if (!tasks.length) return <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No tasks found for this project.</p>;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "var(--status-low)";
            case "in_progress": return "var(--status-medium)";
            default: return "var(--text-muted)";
        }
    };

    return (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {tasks.map((t) => (
                <li
                    key={t.id}
                    className="card"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem"
                    }}
                >
                    <span style={{ fontSize: "1rem", fontWeight: 500 }}>{t.title}</span>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <span style={{
                            fontSize: "0.8rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(255,255,255,0.1)",
                            color: "var(--text-muted)"
                        }}>
                            {t.priority}
                        </span>
                        <span style={{
                            color: getStatusColor(t.status),
                            fontWeight: 600,
                            fontSize: "0.9rem"
                        }}>
                            {t.status}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
