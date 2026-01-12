import { useEffect, useState } from "react";
import { type Task, getTasksByProject, getTasksByRange } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import { LayoutList, Activity, CheckCircle2, AlertCircle, Zap, TrendingUp, Trophy, Plus } from "lucide-react";
import { useUser } from "../context/UserContext";
import StatsCard from "../components/status-bar-components/StatsCard";
import AiFlowCoach from "../components/ai/AiFlowCoach";
import PriorityPipeline from "../components/priority/PriorityPipeline";
import ActivityFeed from "../components/activity/ActivityFeed";
import StreakCounter from "../components/achievements/StreakCounter";
import EmptyState from "../components/state/EmptyState";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../api/auth";

export default function Dashboard() {
    const { activeProjectId } = useProject();
    const { refreshTrigger } = useTasks();
    const { user } = useUser();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [mounted, setMounted] = useState(false);
    const [focusData, setFocusData] = useState<{ day: string; percent: number }[]>([]);

    useEffect(() => {
        const fetchFocusTrend = async () => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 6); // Last 7 days including today

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const tasksInRange = await getTasksByRange(formatDate(start), formatDate(end));

            const dailyStats = new Map<string, { total: number; done: number }>();

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const dateStr = formatDate(d);
                dailyStats.set(dateStr, { total: 0, done: 0 });
            }

            // Fill with task data
            tasksInRange.forEach(t => {
                if (t.due_date) {
                    const dateStr = t.due_date.split('T')[0];
                    if (dailyStats.has(dateStr)) {
                        const stat = dailyStats.get(dateStr)!;
                        stat.total++;
                        if (t.status.toLowerCase() === 'done') {
                            stat.done++;
                        }
                    }
                }
            });

            // Convert map to array
            const data: { day: string; percent: number }[] = [];
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const dateStr = formatDate(d);
                const stat = dailyStats.get(dateStr) || { total: 0, done: 0 };

                const percent = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
                data.push({
                    day: daysOfWeek[d.getDay()],
                    percent: percent
                });
            }
            setFocusData(data);
        };

        if (activeProjectId) {
            fetchFocusTrend();
        }
    }, [activeProjectId, refreshTrigger]);

    useEffect(() => {
        setMounted(true);
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
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

    if (totalTasks === 0) {
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
                            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Member'}</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <Zap size={12} className="text-indigo-400 fill-indigo-400" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Level {user?.level || 1}</span>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm mt-0.5">Initialize your daily mission. The coach is analyzing your throughput.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div className="text-right">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Global XP</p>
                        <p className="text-lg font-bold text-white">{user?.xp || 0} <span className="text-xs text-zinc-500">pts</span></p>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="text-right">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Efficiency</p>
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
                <div className="col-span-1 p-5 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                <Trophy size={16} />
                            </div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Level System</h3>
                        </div>
                        <button
                            onClick={() => navigate('/app/v1/focus/history')}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                        >
                            History
                        </button>
                    </div>

                    {/* Big Level Number */}
                    <div className="mb-5 relative z-10">
                        <p className="text-4xl font-bold text-white leading-none">
                            {user?.level || 1} <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Level</span>
                        </p>
                    </div>

                    {/* XP Info */}
                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Total XP</span>
                            <span className="text-sm text-indigo-400 font-bold">{user?.xp || 0} pts</span>
                        </div>

                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out"
                                style={{ width: `${(user?.xp || 0) % 100}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                {100 - ((user?.xp || 0) % 100)} XP to next level
                            </span>
                            <span className="text-sm text-blue-400 font-bold">{((user?.xp || 0) % 100)}%</span>
                        </div>
                    </div>
                </div>

                {/* Focus Velocity Card */}
                <div className="col-span-1 p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:animate-pulse">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Focus Analytics</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">7-Day Trend</p>
                        </div>
                    </div>

                    <div className="h-28 flex items-end gap-2 px-1 relative z-10">
                        {focusData.map((data, i) => {
                            const height = Math.max(data.percent || 8, 8); // Минимум 8% для видимости
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group/bar h-full relative">
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none z-20">
                                        <div className="bg-zinc-800/95 border border-white/10 rounded-lg px-2 py-1 shadow-xl backdrop-blur-sm whitespace-nowrap">
                                            <span className="text-xs font-semibold text-white">{data.percent}%</span>
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800/95 border-r border-b border-white/10 rotate-45" />
                                        </div>
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-600/30 to-purple-500/20 rounded-t-sm group-hover/bar:from-purple-500/50 group-hover/bar:to-purple-400/40 border-t border-x border-purple-500/20 group-hover/bar:border-purple-400/40 transition-all duration-300 cursor-pointer"
                                        style={{ height: `${height}%` }}
                                        title={`${data.percent}% completion on ${data.day}`}
                                    />
                                    <span className="text-xs text-zinc-500 text-center mt-2 uppercase font-medium">{data.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
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
