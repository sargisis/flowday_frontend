import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center border border-white/5 rounded-[2rem] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm relative overflow-hidden group ${className}`}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-500" />

            <div className="p-5 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl mb-6 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Icon size={32} className="text-indigo-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 font-outfit tracking-tight">{title}</h3>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed text-sm font-medium">
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border border-white/10"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
