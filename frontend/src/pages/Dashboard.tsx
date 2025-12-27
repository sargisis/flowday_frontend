import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { LayoutList, Activity, CheckCircle2, AlertCircle, Zap, TrendingUp } from "lucide-react";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
    const { activeProjectId } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [greeting, setGreeting] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (!activeProjectId) {
        return <EmptyState />;
    }

    return (
        <div className={`min-h-screen p-8 lg:p-12 space-y-12 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header Section */}
            <header className="relative z-10 animate-in slide-in-from-top-5 duration-700">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 tracking-tight font-[Outfit]">
                        {greeting}, User.
                    </h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg shadow-black/10 group cursor-default hover:bg-white/10 transition-colors">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse relative z-10" />
                            <div className="absolute inset-0 bg-emerald-500 blur-sm animate-pulse" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-100/80 tracking-wide uppercase">System Online</span>
                    </div>
                </div>
                <p className="text-zinc-400 text-lg font-light tracking-wide">
                    Ready to enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-semibold shadow-orange-500/20 drop-shadow-sm">Flow State</span>?
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 duration-700 delay-100 fill-mode-backwards">
                <StatsCard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={LayoutList}
                    color="text-blue-400"
                    bg="from-blue-500/[0.15] to-blue-500/[0.02]"
                    border="border-blue-500/20 group-hover:border-blue-500/30"
                    shadow="shadow-blue-500/10"
                />
                <StatsCard
                    title="In Progress"
                    value={inProgressTasks}
                    icon={Activity}
                    color="text-amber-400"
                    bg="from-amber-500/[0.15] to-amber-500/[0.02]"
                    border="border-amber-500/20 group-hover:border-amber-500/30"
                    shadow="shadow-amber-500/10"
                />
                <StatsCard
                    title="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    color="text-emerald-400"
                    bg="from-emerald-500/[0.15] to-emerald-500/[0.02]"
                    border="border-emerald-500/20 group-hover:border-emerald-500/30"
                    shadow="shadow-emerald-500/10"
                />
                <StatsCard
                    title="Blocked"
                    value={blockedTasks}
                    icon={AlertCircle}
                    color="text-rose-400"
                    bg="from-rose-500/[0.15] to-rose-500/[0.02]"
                    border="border-rose-500/20 group-hover:border-rose-500/30"
                    shadow="shadow-rose-500/10"
                />
            </div>

            {/* Productivity Insight Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
                {/* Flow Score Card */}
                <div className="col-span-1 p-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-xl shadow-black/20 backdrop-blur-xl flex flex-col justify-between min-h-[320px]">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 scale-150 rotate-12 origin-top-right">
                        <Zap size={180} className="text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                                    <Zap size={24} className="fill-orange-500/20" />
                                </div>
                                <h3 className="text-xl font-semibold text-white tracking-wide font-[Outfit]">Flow Score</h3>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${completionRate === 100 ? 'from-amber-300 via-orange-400 to-amber-300 animate-text-shimmer bg-[length:200%_auto]' : 'from-white to-white/60'} tracking-tight drop-shadow-sm font-[Outfit]`}>
                                    {completionRate}%
                                </span>
                            </div>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[80%]">
                                Your daily momentum based on task completion velocity.
                            </p>
                        </div>

                        <div className="mt-8 relative">
                            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 inset-shadow-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 shadow-[0_0_20px_rgba(251,146,60,0.4)] relative overflow-hidden"
                                    style={{ width: `${completionRate}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Focus Suggestion */}
                <div className="col-span-1 lg:col-span-2 p-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-purple-500/[0.05] via-purple-500/[0.01] to-transparent relative overflow-hidden shadow-xl shadow-black/20 backdrop-blur-xl group hover:border-purple-500/20 transition-all duration-500 min-h-[320px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/[0.03] to-transparent opacity-50" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-white tracking-wide font-[Outfit]">Focus Trend</h3>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
                        </div>
                    </div>

                    <div className="h-48 flex items-end gap-4 px-2 relative z-10">
                        {/* Mock Chart Bars */}
                        {[45, 70, 50, 85, 60, 95, 75].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group/bar cursor-default h-full">
                                <div className="flex flex-col h-full justify-end relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-500/20 to-purple-500/5 group-hover/bar:from-purple-500 group-hover/bar:to-purple-400 transition-all duration-500 ease-out relative rounded-xl backdrop-blur-sm border border-purple-500/10 group-hover/bar:border-purple-500/50 group-hover/bar:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 translate-y-2 group-hover/bar:translate-y-0 shadow-xl border border-white/10 whitespace-nowrap z-20 backdrop-blur-md pointer-events-none">
                                            {h}% Focus
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900/90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <span className="text-xs font-medium text-zinc-500 group-hover/bar:text-purple-300 transition-colors uppercase tracking-wider">
                                        Day {i + 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
