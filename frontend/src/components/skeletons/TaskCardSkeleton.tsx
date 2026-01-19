export const TaskCardSkeleton = () => {
    return (
        <div className="bg-zinc-900/40 rounded-xl p-4 border border-white/5 animate-pulse">
            <div className="space-y-3">
                {/* Title */}
                <div className="h-4 bg-zinc-800/50 rounded w-3/4"></div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-3 bg-zinc-800/30 rounded w-full"></div>
                    <div className="h-3 bg-zinc-800/30 rounded w-2/3"></div>
                </div>

                {/* Metadata badges */}
                <div className="flex gap-2 items-center pt-2">
                    <div className="h-6 w-16 bg-zinc-800/30 rounded-full"></div>
                    <div className="h-6 w-20 bg-zinc-800/30 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
