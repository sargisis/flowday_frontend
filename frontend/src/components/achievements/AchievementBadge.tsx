import { useEffect, useState } from 'react';
import api from '../../api/axios';

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

interface AchievementBadgeProps {
    achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
    const { achievement: ach, progress, is_unlocked } = achievement;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'border-zinc-600 bg-zinc-800/50';
            case 'uncommon': return 'border-green-600/40 bg-green-950/50';
            case 'rare': return 'border-blue-600/40 bg-blue-950/50';
            case 'epic': return 'border-purple-600/40 bg-purple-950/50';
            case 'legendary': return 'border-amber-600/40 bg-amber-950/50';
            default: return 'border-zinc-600 bg-zinc-800/50';
        }
    };

    const getProgressPercent = () => {
        if (is_unlocked) return 100;
        return Math.min((progress / ach.requirement) * 100, 100);
    };

    return (
        <div
            className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${is_unlocked
                    ? getRarityColor(ach.rarity) + ' opacity-100 scale-100'
                    : 'border-white/5 bg-zinc-900/50 grayscale opacity-60 hover:opacity-80'
                } overflow-hidden group`}
        >
            {/* Background Glow Effect */}
            {is_unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`text-6xl mb-4 ${is_unlocked ? 'animate-bounce-slow' : ''}`}>
                    {ach.icon}
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold mb-1 ${is_unlocked ? 'text-white' : 'text-zinc-500'
                    }`}>
                    {ach.title}
                </h3>

                {/* Description */}
                <p className={`text-xs mb-4 ${is_unlocked ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                    {ach.description}
                </p>

                {/* Progress Bar */}
                {!is_unlocked && (
                    <div className="w-full">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-2 uppercase tracking-wider font-bold">
                            <span>Progress</span>
                            <span>{progress}/{ach.requirement}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${getProgressPercent()}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Unlocked Badge */}
                {is_unlocked && (
                    <div className="mt-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            ✓ Unlocked
                        </span>
                    </div>
                )}

                {/* XP Reward */}
                <div className={`mt-3 text-[11px] font-bold ${is_unlocked ? 'text-amber-400' : 'text-zinc-600'
                    }`}>
                    +{ach.xp_reward} XP
                </div>
            </div>
        </div>
    );
}
