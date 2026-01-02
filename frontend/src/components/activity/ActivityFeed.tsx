
import { useState, useEffect } from "react";
import { CheckCircle2, Zap, Plus, Folder, History } from "lucide-react";
import api from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

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

        // Polling for new activities every 10 seconds for more real-time feel
        const interval = setInterval(fetchActivities, 10000);
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

    return (
        <div className="p-8 rounded-[1.5rem] border border-white/10 bg-zinc-900/50 shadow-xl backdrop-blur-xl h-full max-h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <h3 className="text-xl font-semibold text-white tracking-wide font-outfit">Activity Feed</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time</span>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 fade-bottom">
                {loading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/5 rounded w-3/4" />
                                    <div className="h-2 bg-white/5 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (activities?.length || 0) === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 text-center px-4">
                        <History size={32} className="mb-4 text-zinc-800" />
                        <p className="text-sm font-medium tracking-tight">No activity logged yet.</p>
                        <p className="text-[10px] uppercase tracking-widest mt-1 text-zinc-600 font-bold">Start your flow</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 group/activity">
                            <div className="flex flex-col items-center">
                                <div className={`p-2.5 rounded-xl ${getBgColor(activity.type)} border border-white/5 shadow-inner`}>
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 w-px bg-gradient-to-b from-white/10 to-transparent my-2 last:hidden" />
                            </div>
                            <div className="pb-6">
                                <p className="text-sm font-medium text-zinc-300 leading-tight mb-1.5 group-hover/activity:text-white transition-colors">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-[0.1em]">
                                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
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
