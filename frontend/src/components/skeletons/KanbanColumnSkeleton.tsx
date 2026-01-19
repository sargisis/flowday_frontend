import { TaskCardSkeleton } from "./TaskCardSkeleton";

export function KanbanColumnSkeleton() {
    return (
        <div className="flex flex-col bg-zinc-900/40 border-2 border-white/5 rounded-2xl p-4 h-full min-h-0 animate-pulse">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <div className="h-5 bg-zinc-800/50 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-zinc-800/30 rounded w-16"></div>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-3 min-h-0 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <TaskCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
