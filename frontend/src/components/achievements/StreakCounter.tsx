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

        // Polling for streak updates every 60 seconds (optimized from 10s - streak doesn't need real-time updates)
        const interval = setInterval(fetchStreak, 60000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    if (loading || !streak) {
        return (
            <div className="p-6 h-[280px] rounded-xl border border-white/5 bg-white/[0.02] animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/5" />
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
        <div className="relative p-5 rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-orange-500/20">
            {/* Glow effects */}
            {isActive && (
                <>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-600/20 blur-[80px] rounded-full" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-600/10 blur-[80px] rounded-full" />
                </>
            )}

            <div className="relative z-10 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Big Fire Icon Circle */}
                        <div className={`relative p-4 rounded-full transition-all duration-500 ${isActive
                            ? 'bg-gradient-to-br from-orange-600/30 to-orange-700/20 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
                            : 'bg-zinc-800/50'
                            }`}>
                            <Flame
                                size={32}
                                className={`relative z-10 ${isActive ? 'text-orange-500 fill-orange-600/40' : 'text-zinc-600'}`}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Daily Streak</h3>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Momentum Engine</p>
                        </div>
                    </div>

                    {/* Right side badges */}
                    <div className="flex flex-col items-end gap-1.5">
                        {streak.longest_streak > 0 && (
                            <div className="px-2.5 py-1 bg-amber-900/30 border border-amber-800/30 rounded-lg">
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    Best: <span className="text-amber-500">{streak.longest_streak}</span>
                                </span>
                            </div>
                        )}
                        {isActive && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Today</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Big Number */}
                <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-white leading-none bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                        {streak.current_streak}
                    </span>
                    <span className="text-xl font-medium text-zinc-500">
                        {streak.current_streak === 1 ? 'day' : 'days'}
                    </span>
                </div>

                {/* Progress Message & Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-400">{getStreakMessage()}</span>
                        {isActive && streak.current_streak < 7 && (
                            <span className="text-sm font-bold text-orange-500">
                                {Math.round((streak.current_streak / 7) * 100)}%
                            </span>
                        )}
                    </div>

                    <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max((streak.current_streak / 7) * 100, 5)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
