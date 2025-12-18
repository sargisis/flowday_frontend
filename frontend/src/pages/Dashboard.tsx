import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";

export default function Dashboard() {
    const { activeProjectId } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
        }
    }, [activeProjectId]);

    // Calculate Stats
    const totalTasks = tasks.length;
    const blockedTasks = tasks.filter(t => t.status.toLowerCase() === 'blocked').length;
    const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'done').length;

    if (!activeProjectId) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>Select a project to view dashboard</p>
            </div>
        );
    }

    return (
        <>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ marginBottom: "0.2rem" }}>Dashboard</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Overview of current tasks and activity</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)" }}>
                <StatsCard title="Total tasks" value={totalTasks} label="+2" />
                <StatsCard title="Blocked" value={blockedTasks} label="0" />
                <StatsCard title="In Progress" value={inProgressTasks} label="+1" />
                <StatsCard title="Completed" value={completedTasks} label="+5" />
            </div>
        </>
    );
}

function StatsCard({ title, value, label }: { title: string; value: number; label: string }) {
    return (
        <div className="card">
            <h4 style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>{title}</h4>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--text-main)" }}>{value}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>
            </div>
        </div>
    );
}
