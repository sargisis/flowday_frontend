interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

export function ProgressBar({ 
    progress, 
    label, 
    showPercentage = true,
    className = ""
}: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-400">{label}</span>
                    {showPercentage && (
                        <span className="text-xs text-zinc-400">{Math.round(clampedProgress)}%</span>
                    )}
                </div>
            )}
            <div className="w-full bg-zinc-800/50 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    );
}
