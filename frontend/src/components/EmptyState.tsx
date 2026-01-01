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
        <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] ${className}`}>
            <div className="p-4 bg-white/5 rounded-full mb-4">
                <Icon size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-outfit">{title}</h3>
            <p className="text-zinc-400 max-w-sm mb-6 leading-relaxed text-sm">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-all border border-white/5"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
