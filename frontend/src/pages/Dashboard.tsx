import { useEffect, useState } from "react";
import { type Task, getTasksByProject, getTasksByRange } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { LayoutList, Activity, CheckCircle2, AlertCircle, Zap, TrendingUp } from "lucide-react";
import StatsCard from "../components/StatsCard";
import AiFlowCoach from "../components/AiFlowCoach";
import PriorityPipeline from "../components/PriorityPipeline";

export default function Dashboard() {
    const { activeProjectId } = useProject();
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
                    const dateStr = t.due_date.split('T')[0]; // Assuming due_date is ISO string
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
    }, [activeProjectId]);

    useEffect(() => {
        setMounted(true);
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
        }
    }, [activeProjectId]);

    // Calculate Stats
    const totalTasks = tasks.length;
    const blockedTasks = tasks.filter(t => t.status.toLowerCase() === 'blocked').length;
    const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'done').length;

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (!activeProjectId) {
        return <EmptyState />;
    }

    return (
        <div className={`min-h-screen p-8 lg:p-12 space-y-12 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Stats Grid - Now at the Top */}
            {/* Stats Grid - Now at the Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-5 duration-700">
                <StatsCard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={LayoutList}
                    color="text-blue-400"
                    bg="from-blue-500/[0.15] to-blue-500/[0.02]"
                    border="border-blue-500/20 group-hover:border-blue-500/30"
                    shadow="shadow-blue-500/10"
                    animation="pulse"
                />
                <StatsCard
                    title="In Progress"
                    value={inProgressTasks}
                    icon={Activity}
                    color="text-amber-400"
                    bg="from-amber-500/[0.15] to-amber-500/[0.02]"
                    border="border-amber-500/20 group-hover:border-amber-500/30"
                    shadow="shadow-amber-500/10"
                    animation="pulse"
                />
                <StatsCard
                    title="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    color="text-emerald-400"
                    bg="from-emerald-500/[0.15] to-emerald-500/[0.02]"
                    border="border-emerald-500/20 group-hover:border-emerald-500/30"
                    shadow="shadow-emerald-500/10"
                    animation="pulse"
                />
                <StatsCard
                    title="Blocked"
                    value={blockedTasks}
                    icon={AlertCircle}
                    color="text-rose-400"
                    bg="from-rose-500/[0.15] to-rose-500/[0.02]"
                    border="border-rose-500/20 group-hover:border-rose-500/30"
                    shadow="shadow-rose-500/10"
                    animation="pulse"
                />
            </div>
            {/* Productivity Stats - Moved Up */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-10 duration-700 delay-100">
                {/* Flow Score Card */}
                <div className="col-span-1 p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:animate-pulse">
                            <Zap size={18} />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-300">Flow Score</h3>
                    </div>
                    <div className="flex items-end gap-2 relative z-10">
                        <span className="text-4xl font-bold text-white font-[Outfit]">{completionRate}%</span>
                        <span className="text-sm text-zinc-500 mb-1">daily velocity</span>
                    </div>
                </div>

                {/* Focus Trend Simple Card */}
                <div className="col-span-1 lg:col-span-2 p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:animate-pulse">
                            <TrendingUp size={18} />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-300">7-Day Focus Trend</h3>
                    </div>

                    <div className="h-32 flex items-end gap-3 px-2 relative z-10">
                        {focusData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group/bar h-full">
                                <div
                                    className="w-full bg-purple-500/10 rounded-t-sm group-hover/bar:bg-purple-500/40 transition-all duration-300"
                                    style={{ height: `${data.percent || 5}%` }}
                                />
                                <span className="text-[10px] text-zinc-500 text-center mt-2 uppercase">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid: AI Coach & Priority Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-backwards">
                <AiFlowCoach />
                <PriorityPipeline />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <LayoutList size={40} className="text-zinc-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3 font-[Outfit]">No Project Selected</h3>
            <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                Select a project from the sidebar to view your dashboard analytics, or create a new one to begin your <span className="text-white font-medium">Flow</span> journey.
            </p>
        </div>
    );
}
