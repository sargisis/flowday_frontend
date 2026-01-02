import { useState, useEffect } from "react";
import { Clock, Trophy, Calendar, Zap, ArrowLeft, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { format } from "date-fns";

interface FocusSession {
    id: string;
    task_title: string;
    duration: number;
    xp: number;
    created_at: string;
}

export default function FocusHistoryPage() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/focus/sessions');
                setSessions(res.data);
            } catch (err) {
                console.error("Failed to fetch focus sessions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalXP = sessions.reduce((acc, s) => acc + s.xp, 0);

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 font-outfit">Focus History</h1>
                        <p className="text-zinc-500">Track your deep work progress and accumulation of focus.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <History size={32} />
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-zinc-500 mb-2">
                            <Clock size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Focus</span>
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-zinc-500 mb-2">
                            <Zap size={16} className="text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">XP Earned</span>
                        </div>
                        <div className="text-3xl font-bold text-amber-400">
                            {totalXP.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-zinc-500 mb-2">
                            <Trophy size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sessions</span>
                        </div>
                        <div className="text-3xl font-bold text-indigo-400">
                            {sessions.length}
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Recent Sessions</h2>
                    {loading ? (
                        <div className="text-center py-12 text-zinc-500">Loading history...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <Zap size={48} className="text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500">No focus sessions found. Time to start your first one!</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="group p-5 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1">{session.task_title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {format(new Date(session.created_at), 'MMM d, yyyy')}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {session.duration} minutes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-amber-400 font-bold">+{session.xp} XP</div>
                                    <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mt-1">Focus Reward</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
