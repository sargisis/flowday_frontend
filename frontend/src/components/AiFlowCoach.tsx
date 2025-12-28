import { Zap, Trophy, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";

export default function AiFlowCoach() {
    return (
        <div className="p-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-indigo-950/30 to-background shadow-xl backdrop-blur-xl relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-12 opacity-5 bg-indigo-500 blur-3xl rounded-full translate-x-10 translate-y-[-50%]" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Zap size={20} className="fill-indigo-500/20" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white tracking-wide font-outfit">AI Flow Coach</h3>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Live Engine</span>
                        </div>
                    </div>
                </div>
                <button className="text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1 group/refresh">
                    REFRESH <ArrowRight size={12} className="group-hover/refresh:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-4 relative z-10">
                {/* Item 1 */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex gap-4 group/item">
                    <div className="mt-1">
                        <Trophy size={18} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-200 mb-1">Momentum Gained</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed group-hover/item:text-zinc-300 transition-colors">
                            You have already finished 8 out of 12 tasks. Leverage this progress to power through the final stretch.
                        </p>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex gap-4 group/item">
                    <div className="mt-1">
                        <Lightbulb size={18} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-200 mb-1">Single-Tasking Mode</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed group-hover/item:text-zinc-300 transition-colors">
                            Close all tabs unrelated to your current objective to minimize cognitive switching costs.
                        </p>
                    </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/10 hover:border-orange-500/20 transition-colors flex gap-4 group/item">
                    <div className="mt-1">
                        <AlertTriangle size={18} className="text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-200 mb-1">Avoid Distraction Traps</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed group-hover/item:text-zinc-300 transition-colors">
                            Even a 30-second phone check can derail your deep work state for up to 20 minutes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full mt-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group/btn relative z-10">
                Start Focus Session
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
