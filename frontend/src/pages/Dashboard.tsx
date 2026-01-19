import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import { LayoutList, Activity, CheckCircle2, AlertCircle, Zap, Plus } from "lucide-react";
import { useUser } from "../context/UserContext";
import StatsCard from "../components/status-bar-components/StatsCard";
import AiFlowCoach from "../components/ai/AiFlowCoach";
import PriorityPipeline from "../components/priority/PriorityPipeline";
import ActivityFeed from "../components/activity/ActivityFeed";
import StreakCounter from "../components/achievements/StreakCounter";
import EmptyState from "../components/state/EmptyState";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../api/auth";
import { useFocusTrend } from "../hooks/useFocusTrend";
import LevelCard from "../components/dashboard/LevelCard";
import FocusTrendCard from "../components/dashboard/FocusTrendCard";
import { DashboardSkeleton } from "../components/skeletons/DashboardSkeleton";

export default function Dashboard() {
    const { activeProjectId } = useProject();
    const { refreshTrigger } = useTasks();
    const { user } = useUser();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Custom Hooks
    const { focusData } = useFocusTrend(activeProjectId, refreshTrigger);

    useEffect(() => {
        setMounted(true);
        if (activeProjectId) {
            setIsLoading(true);
            getTasksByProject(activeProjectId)
                .then(setTasks)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [activeProjectId, refreshTrigger]);

    // Calculate Stats
    const totalTasks = tasks.length;
    const blockedTasks = tasks.filter(t => t.status.toLowerCase() === 'blocked').length;
    const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'done').length;


    if (!activeProjectId) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                    icon={LayoutList}
                    title="No Project Selected"
                    description="Synchronize with a project from the command interface to initialize mission analytics."
                />
            </div>
        );
    }

    // Use Skeleton while loading if needed, or if no tasks but project selected (optional choice)
    // But original logic showed EmptyState if 0 tasks.
    if (totalTasks === 0 && mounted) { // Added mounted check to prevent flash
        return (
            <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                    icon={Plus}
                    title="Mission Blueprint Empty"
                    description="Inert project detected. No active tasks found. Initialize your first objective to engage system monitoring."
                    action={{
                        label: "Go to Tasks",
                        onClick: () => navigate("/app/v1/tasks")
                    }}
                />
            </div>
        );
    }

    if (isLoading || (!mounted && totalTasks === 0)) return <DashboardSkeleton />;

    return (
        <div className={`min-h-screen p-4 lg:p-6 space-y-4 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Compact Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-left-5 duration-700">
                <div className="flex items-center gap-3">
                    {user?.avatar_url && (
                        <img
                            src={getAvatarUrl(user.avatar_url) || ""}
                            alt="Avatar"
                            className="h-9 w-9 rounded-lg object-cover ring-2 ring-white/10"
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Member'}</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <Zap size={12} className="text-indigo-400 fill-indigo-400" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Level {user?.level || 1}</span>
                            </div>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-0.5">Initialize your daily mission. The coach is analyzing your throughput.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-zinc-300/30 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                    <div className="text-right">
                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Global XP</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{user?.xp || 0} <span className="text-xs text-zinc-500 dark:text-zinc-400">pts</span></p>
                    </div>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-white/10" />
                    <div className="text-right">
                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Efficiency</p>
                        <p className="text-lg font-bold text-indigo-400">{(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)}%</p>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in slide-in-from-top-5 duration-700">
                <StatsCard title="Total Tasks" value={totalTasks} icon={LayoutList} color="text-blue-400" bg="from-blue-500/[0.15] to-blue-500/[0.02]" border="border-blue-500/20" shadow="shadow-blue-500/10" animation="pulse" />
                <StatsCard title="In Progress" value={inProgressTasks} icon={Activity} color="text-amber-400" bg="from-amber-500/[0.15] to-amber-500/[0.02]" border="border-amber-500/20" shadow="shadow-amber-500/10" animation="pulse" />
                <StatsCard title="Completed" value={completedTasks} icon={CheckCircle2} color="text-emerald-400" bg="from-emerald-500/[0.15] to-emerald-500/[0.02]" border="border-emerald-500/20" shadow="shadow-emerald-500/10" animation="pulse" />
                <StatsCard title="Blocked" value={blockedTasks} icon={AlertCircle} color="text-rose-400" bg="from-rose-500/[0.15] to-rose-500/[0.02]" border="border-rose-500/20" shadow="shadow-rose-500/10" animation="pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-10 duration-700 delay-100">
                <div className="col-span-1">
                    <StreakCounter refreshTrigger={refreshTrigger} />
                </div>

                {/* Level System Card */}
                <LevelCard user={user} />

                {/* Focus Velocity Card */}
                <FocusTrendCard data={focusData} />
            </div>

            {/* Main Content Grid: AI Coach, Priority Pipeline & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-backwards">
                <AiFlowCoach tasks={tasks} />
                <PriorityPipeline />
                <ActivityFeed />
            </div>
        </div>
    );
}
