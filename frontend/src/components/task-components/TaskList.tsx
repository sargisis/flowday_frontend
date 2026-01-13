import type { Task } from "../../api/tasks";

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
                        <a
                            href={`/app/v1/focus/${t.id}`}
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
                                padding: "0.3rem 0.8rem",
                                borderRadius: "99px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "white",
                                boxShadow: "0 2px 10px rgba(139, 92, 246, 0.3)"
                            }}
                        >
                            <span>⚡ Focus</span>
                        </a>
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
