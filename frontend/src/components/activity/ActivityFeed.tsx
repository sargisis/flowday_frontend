
import { useState, useEffect } from "react";
import { CheckCircle2, Zap, Plus, Folder, History, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import { formatDistanceToNow, isToday } from "date-fns";
import { ActivityItemSkeleton } from "../skeletons/ActivityItemSkeleton";

interface Activity {
    id: string;
    type: 'task_created' | 'task_completed' | 'focus_started' | 'focus_completed' | 'project_created';
    description: string;
    metadata?: Record<string, string>;
    created_at: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'tasks' | 'focus' | 'projects'>('all');
    const [filterTime, setFilterTime] = useState<'all' | 'today'>('all');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await api.get('/activity');
                const activitiesData = res.data?.data || res.data || [];
                setActivities(Array.isArray(activitiesData) ? activitiesData : []);
            } catch (err) {
                console.error("Failed to fetch activity feed", err);
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();

        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'task_created': return <Plus size={14} className="text-blue-400" />;
            case 'task_completed': return <CheckCircle2 size={14} className="text-emerald-400" />;
            case 'focus_completed': return <Zap size={14} className="text-amber-400" />;
            case 'project_created': return <Folder size={14} className="text-purple-400" />;
            default: return <History size={14} className="text-zinc-400" />;
        }
    };

    const getThemeColors = (type: Activity['type']) => {
        switch (type) {
            case 'task_created': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10', glow: 'group-hover/activity:bg-blue-500/20' };
            case 'task_completed': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10', glow: 'group-hover/activity:bg-emerald-500/20' };
            case 'focus_completed': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10', glow: 'group-hover/activity:bg-amber-500/20' };
            case 'project_created': return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', shadow: 'shadow-purple-500/10', glow: 'group-hover/activity:bg-purple-500/20' };
            default: return { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', shadow: 'shadow-zinc-500/10', glow: 'group-hover/activity:bg-zinc-500/20' };
        }
    };

    const filteredActivities = activities.filter(activity => {
        const typeMatch = (() => {
            if (filterType === 'all') return true;
            if (filterType === 'tasks') return activity.type.includes('task');
            if (filterType === 'focus') return activity.type.includes('focus');
            if (filterType === 'projects') return activity.type.includes('project');
            return true;
        })();

        const timeMatch = (() => {
            if (filterTime === 'all') return true;
            if (filterTime === 'today') return isToday(new Date(activity.created_at));
            return true;
        })();

        return typeMatch && timeMatch;
    });

    return (
        <div className="p-6 h-[480px] rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl flex flex-col overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 shrink-0 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <History size={18} className="text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight font-outfit leading-none">Activity Feed</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Live Mission Log</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Total
                    </button>
                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                    <button
                        onClick={() => setFilterType('tasks')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === 'tasks' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Tasks
                    </button>
                    <button
                        onClick={() => setFilterType('focus')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === 'focus' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Focus
                    </button>
                    <button
                        onClick={() => setFilterType('projects')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === 'projects' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Projects
                    </button>
                    <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-px h-3 bg-white/10 mr-1" />
                        <button
                            onClick={() => setFilterTime(filterTime === 'all' ? 'today' : 'all')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterTime === 'today' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'text-zinc-500 border-transparent hover:text-emerald-400/50'}`}
                        >
                            {filterTime === 'today' ? 'Today' : 'All Time'}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 relative z-10">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <ActivityItemSkeleton key={i} />
                        ))}
                    </div>
                ) : (filteredActivities.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 text-center px-4 animate-in fade-in duration-700">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                            <History size={32} className="text-zinc-800" />
                        </div>
                        <p className="text-sm font-medium tracking-tight">System log empty.</p>
                        <p className="text-[10px] uppercase tracking-widest mt-1 text-zinc-600 font-bold leading-none">Awaiting mission updates...</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredActivities.map((activity, idx) => {
                            const colors = getThemeColors(activity.type);
                            return (
                                <div key={activity.id} className="flex gap-4 group/activity p-3 rounded-2xl hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-white/5">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${colors.bg} ${colors.border} border transition-all duration-500 group-hover/activity:scale-110 group-hover/activity:rotate-3 shadow-lg ${colors.shadow}`}>
                                            {getIcon(activity.type)}
                                        </div>
                                        {idx !== filteredActivities.length - 1 && (
                                            <div className="w-px h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent my-1" />
                                        )}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-[13px] font-medium text-zinc-300 leading-snug group-hover/activity:text-white transition-colors duration-300">
                                                {activity.description}
                                            </p>
                                            <ArrowRight size={12} className="text-white/0 group-hover/activity:text-white/20 transition-all duration-300 -translate-x-2 group-hover/activity:translate-x-0 shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                            </span>
                                            {activity.type.includes('task') && (
                                                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                            )}
                                            {activity.type.includes('task') && (
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                                    Task Event
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="h-8 shrink-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none absolute bottom-0 left-0 right-0 z-20 rounded-b-[2rem]" />
        </div>
    );
}
