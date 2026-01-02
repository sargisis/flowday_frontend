import { useEffect, useState } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AchievementBadge from '../components/achievements/AchievementBadge';

interface Achievement {
    achievement: {
        id: string;
        title: string;
        description: string;
        icon: string;
        type: string;
        rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
        xp_reward: number;
        requirement: number;
    };
    progress: number;
    is_unlocked: boolean;
    unlocked_at?: string;
}

export default function AchievementsPage() {
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await api.get('/achievements');
                setAchievements(res.data);
            } catch (err) {
                console.error('Failed to fetch achievements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const filteredAchievements = achievements.filter(ach => {
        if (filter === 'unlocked') return ach.is_unlocked;
        if (filter === 'locked') return !ach.is_unlocked;
        return true;
    });

    const unlockedCount = achievements.filter(a => a.is_unlocked).length;
    const totalCount = achievements.length;
    const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Achievements
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Collect badges and track your progress
                        </p>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-8 shrink-0">
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="text-2xl font-black text-white mb-1">{unlockedCount}/{totalCount}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Unlocked</div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="text-2xl font-black text-indigo-400 mb-1">{completionPercent}%</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Completion</div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="text-2xl font-black text-amber-400 mb-1">
                        {achievements.find(a => a.achievement.rarity === 'legendary' && a.is_unlocked) ? '🏆' : '🔒'}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Rarest</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 shrink-0">
                {(['all', 'unlocked', 'locked'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-white/5" />
                        ))}
                    </div>
                ) : filteredAchievements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                        <Trophy size={48} className="mb-4" />
                        <p className="text-sm font-medium">No achievements found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                        {filteredAchievements.map((achievement) => (
                            <AchievementBadge key={achievement.achievement.id} achievement={achievement} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
