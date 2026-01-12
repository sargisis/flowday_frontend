
import { useState, useEffect } from "react";
import { CheckCircle2, Zap, Plus, Folder, History } from "lucide-react";
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
                setActivities(res.data);
            } catch (err) {
                console.error("Failed to fetch activity feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();

        // Polling for new activities every 30 seconds (optimized from 10s to reduce server load)
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'task_created': return <Plus size={16} className="text-blue-400" />;
            case 'task_completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
            case 'focus_completed': return <Zap size={16} className="text-amber-400" />;
            case 'project_created': return <Folder size={16} className="text-purple-400" />;
            default: return <History size={16} className="text-zinc-400" />;
        }
    };

    const getBgColor = (type: Activity['type']) => {
        switch (type) {
            case 'task_created': return 'bg-blue-500/10';
            case 'task_completed': return 'bg-emerald-500/10';
            case 'focus_completed': return 'bg-amber-500/10';
            case 'project_created': return 'bg-purple-500/10';
            default: return 'bg-zinc-500/10';
        }
    };

    // Filter Logic
    const filteredActivities = activities.filter(activity => {
        // Filter by Type
        const typeMatch = (() => {
            if (filterType === 'all') return true;
            if (filterType === 'tasks') return activity.type.includes('task');
            if (filterType === 'focus') return activity.type.includes('focus');
            if (filterType === 'projects') return activity.type.includes('project');
            return true;
        })();

        // Filter by Time
        const timeMatch = (() => {
            if (filterTime === 'all') return true;
            if (filterTime === 'today') return isToday(new Date(activity.created_at));
            return true;
        })();

        return typeMatch && timeMatch;
    });

    return (
        <div className="p-6 h-[450px] rounded-[1.5rem] border border-white/10 bg-zinc-900/50 shadow-xl backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white tracking-wide font-outfit">Activity Feed</h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterType === 'all' ? 'bg-white/10 text-white border-white/20' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('tasks')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterType === 'tasks' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setFilterType('focus')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterType === 'focus' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            Focus
                        </button>
                        <button
                            onClick={() => setFilterType('projects')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterType === 'projects' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            Projects
                        </button>
                        <div className="mx-1 h-4 w-px bg-white/10" />
                        <button
                            onClick={() => setFilterTime(filterTime === 'all' ? 'today' : 'all')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterTime === 'today' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            Today
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Real-time</span>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 fade-bottom">
                {loading ? (
                    <div className="space-y-0">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <ActivityItemSkeleton key={i} />
                        ))}
                    </div>
                ) : (filteredActivities.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 text-center px-4">
                        <History size={32} className="mb-4 text-zinc-800" />
                        <p className="text-sm font-medium tracking-tight">No activity found.</p>
                        <p className="text-xs uppercase tracking-wider mt-1 text-zinc-600 font-bold">Try adjusting filters</p>
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 group/activity">
                            <div className="flex flex-col items-center">
                                <div className={`p-2.5 rounded-xl ${getBgColor(activity.type)} border border-white/5 shadow-inner`}>
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 w-px bg-gradient-to-b from-white/10 to-transparent my-2 last:hidden" />
                            </div>
                            <div className="pb-4">
                                <p className="text-sm font-medium text-zinc-300 leading-tight mb-1.5 group-hover/activity:text-white transition-colors">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
