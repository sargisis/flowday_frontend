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
            <div className="p-8 rounded-[1.5rem] border border-white/10 bg-zinc-900/50 backdrop-blur-xl animate-pulse">
                <div className="h-20 bg-white/5 rounded" />
            </div>
        );
    }

    const getStreakMessage = () => {
        if (streak.current_streak === 0) return 'Complete any task to start your streak!';
        if (streak.current_streak === 1) return 'Keep it going! Activity recorded for today.';
        if (streak.current_streak < 7) return `${7 - streak.current_streak} days until Week Warrior 🏆`;
        return 'You\'re on fire! 🚀';
    };

    const isActive = streak.current_streak > 0;

    return (
        <div className="p-8 rounded-[1.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Flame particles effect when streak is active */}
            {isActive && (
                <>
                    <div className="absolute top-4 right-4 w-24 h-24 bg-orange-500/10 blur-3xl rounded-full animate-pulse" />
                    <div className="absolute bottom-4 left-4 w-20 h-20 bg-amber-500/10 blur-2xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive
                            ? 'bg-orange-500/10 text-orange-400 group-hover:animate-bounce'
                            : 'bg-zinc-800/50 text-zinc-600'
                            }`}>
                            <Flame size={18} className={isActive ? 'fill-orange-500/20' : ''} />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-300">Daily Streak</h3>
                    </div>
                    {streak.longest_streak > 0 && (
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                Best: <span className="text-amber-400">{streak.longest_streak}</span>
                            </div>
                            {isActive && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Active today</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Streak Display */}
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-white font-[Outfit] tabular-nums">
                        {streak.current_streak}
                    </span>
                    <span className="text-lg text-zinc-500 mb-1 font-medium">
                        {streak.current_streak === 1 ? 'day' : 'days'}
                    </span>
                </div>

                {/* Progress Message */}
                <p className="text-xs text-zinc-400 font-medium">
                    {getStreakMessage()}
                </p>

                {/* Progress bar to next milestone */}
                {streak.current_streak > 0 && streak.current_streak < 7 && (
                    <div className="mt-4">
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                style={{ width: `${(streak.current_streak / 7) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
