import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import api from '../../api/axios';

interface Streak {
    current_streak: number;
    longest_streak: number;
    last_active_date?: string;
}

interface StreakCounterProps {
    refreshTrigger?: number;
}

export default function StreakCounter({ refreshTrigger = 0 }: StreakCounterProps) {
    const [streak, setStreak] = useState<Streak | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const res = await api.get('/streak');
                setStreak(res.data);
            } catch (err) {
                console.error('Failed to fetch streak:', err);
                setStreak({ current_streak: 0, longest_streak: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStreak();

        // Polling for streak updates every 10 seconds (more responsive)
        const interval = setInterval(fetchStreak, 10000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    if (loading || !streak) {
        return (
            <div className="p-8 h-[200px] rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-3xl animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
            </div>
        );
    }

    const getStreakMessage = () => {
        if (streak.current_streak === 0) return 'Complete any task to start your streak!';
        if (streak.current_streak === 1) return 'Activity recorded for today. Keep it up!';
        if (streak.current_streak < 7) return `${7 - streak.current_streak} days until your next milestone! 🏆`;
        return 'You\'re on a legendary run! 🚀';
    };

    const isActive = streak.current_streak > 0;

    return (
        <div className="group relative p-8 rounded-[2rem] border border-white/10 bg-zinc-950/40 backdrop-blur-3xl overflow-hidden transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]">
            {/* Ambient Background Glows */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/10 blur-[100px] rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`relative p-3 rounded-2xl transition-all duration-500 ${isActive
                                ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                                : 'bg-zinc-800/50 text-zinc-500'
                            }`}>
                            {isActive && <div className="absolute inset-0 rounded-2xl bg-orange-500 animate-ping opacity-20" />}
                            <Flame
                                size={24}
                                className={`relative z-10 ${isActive ? 'fill-orange-500/20 animate-pulse' : ''}`}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight font-outfit">Daily Streak</h3>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Momentum Engine</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {streak.longest_streak > 0 && (
                            <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                    Best: <span className="text-amber-400 ml-1">{streak.longest_streak}</span>
                                </span>
                            </div>
                        )}
                        {isActive && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Today</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-8 mb-6 flex items-baseline gap-3">
                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-orange-500/50 font-outfit leading-none">
                        {streak.current_streak}
                    </span>
                    <span className="text-2xl font-bold text-zinc-400 font-outfit">
                        {streak.current_streak === 1 ? 'day' : 'days'}
                    </span>
                </div>

                {/* Progress & Message */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-zinc-400">{getStreakMessage()}</span>
                        {isActive && streak.current_streak < 7 && (
                            <span className="text-orange-400">{Math.round((streak.current_streak / 7) * 100)}%</span>
                        )}
                    </div>

                    <div className="relative w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max((streak.current_streak / 7) * 100, 5)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
