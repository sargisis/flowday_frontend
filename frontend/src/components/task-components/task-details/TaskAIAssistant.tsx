import { Sparkles, Edit3, Network } from "lucide-react";

interface TaskAIAssistantProps {
    onEnrich: () => Promise<void>;
    onDecompose: () => Promise<void>;
    isEnriching: boolean;
    isDecomposing: boolean;
}

export function TaskAIAssistant({ onEnrich, onDecompose, isEnriching, isDecomposing }: TaskAIAssistantProps) {
    return (
        <div className="p-5 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-xl">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <Sparkles size={16} className="text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white">AI Assistant</h4>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Augment your workflow</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={onEnrich}
                        disabled={isEnriching || isDecomposing}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col gap-2 transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center justify-between w-full">
                            <Edit3 size={16} className="text-blue-400" />
                            {isEnriching && <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Magic Plan</p>
                            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Fills description & checklist items.</p>
                        </div>
                    </button>

                    <button
                        onClick={onDecompose}
                        disabled={isEnriching || isDecomposing}
                        className="px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl flex flex-col gap-2 transition-all active:scale-[0.98] group shadow-[0_10px_30px_rgba(168,85,247,0.1)]"
                    >
                        <div className="flex items-center justify-between w-full">
                            <Network size={16} className="text-purple-400" />
                            {isDecomposing && <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Magic Decompose</p>
                            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Splits into separate project cards.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
