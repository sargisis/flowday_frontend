import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { LayoutList, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export default function Dashboard() {
    const { activeProjectId } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
        }
    }, [activeProjectId]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    // Calculate Stats
    const totalTasks = tasks.length;
    const blockedTasks = tasks.filter(t => t.status.toLowerCase() === 'blocked').length;
    const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'done').length;

    if (!activeProjectId) {
        return <EmptyState />;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="welcome-text">{greeting}, User</h1>
                    <p className="date-text">Here is what's happening in your project today.</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={LayoutList}
                    color="#3b82f6"
                    className="total"
                />
                <StatsCard
                    title="In Progress"
                    value={inProgressTasks}
                    icon={Activity}
                    color="#f59e0b"
                    className="progress"
                />
                <StatsCard
                    title="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    color="#10b981"
                    className="done"
                />
                <StatsCard
                    title="Blocked"
                    value={blockedTasks}
                    icon={AlertCircle}
                    color="#ef4444"
                    className="blocked"
                />
            </div>

            {/* Recent Activity or Task List could go here, for now keeping it simple */}
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, className }: any) {
    return (
        <div className={`stat-card ${className}`}>
            <Icon className="stat-icon-bg" size={120} color={color} />
            <div className="stat-header">
                <span className="stat-title">{title}</span>
                <Icon size={24} color={color} style={{ opacity: 0.8 }} />
            </div>
            <div className="stat-value">{value}</div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-icon-container">
                <LayoutList size={40} color="#a1a1aa" />
            </div>
            <h3 className="empty-title">No Project Selected</h3>
            <p className="empty-desc">
                Select a project from the sidebar to view your dashboard stats, or create a new one to get started.
            </p>
        </div>
    );
}
