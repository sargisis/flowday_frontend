import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../context/UserContext";

interface LevelCardProps {
    user: User | null;
}

export default function LevelCard({ user }: LevelCardProps) {
    const navigate = useNavigate();

    return (
        <div className="col-span-1 p-5 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group hover:-translate-y-1 hover:border-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <Trophy size={16} />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Level System</h3>
                </div>
                <button
                    onClick={() => navigate('/app/v1/focus/history')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                >
                    History
                </button>
            </div>

            {/* Big Level Number */}
            <div className="mb-5 relative z-10">
                <p className="text-4xl font-bold text-white leading-none">
                    {user?.level || 1} <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Level</span>
                </p>
            </div>

            {/* XP Info */}
            <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Total XP</span>
                    <span className="text-sm text-indigo-400 font-bold">{user?.xp || 0} pts</span>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(user?.xp || 0) % 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                        {100 - ((user?.xp || 0) % 100)} XP to next level
                    </span>
                    <span className="text-sm text-blue-400 font-bold">{((user?.xp || 0) % 100)}%</span>
                </div>
            </div>
        </div>
    );
}
