import { cn } from "../utils/cn";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "card";
    width?: string | number;
    height?: string | number;
    lines?: number; // For text variant
}

export function Skeleton({ 
    className, 
    variant = "rectangular", 
    width, 
    height,
    lines = 1 
}: SkeletonProps) {
    const baseClasses = "animate-pulse bg-zinc-800/50 rounded";
    
    const variantClasses = {
        text: "h-4 rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg",
        card: "rounded-xl border border-zinc-800/50",
    };

    if (variant === "text" && lines > 1) {
        return (
            <div className={cn("space-y-2", className)}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            baseClasses,
                            variantClasses.text,
                            i === lines - 1 ? "w-3/4" : "w-full"
                        )}
                        style={{ height: height || "1rem" }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={{
                width: width || (variant === "circular" ? "40px" : "100%"),
                height: height || (variant === "circular" ? "40px" : variant === "text" ? "1rem" : "200px"),
            }}
        />
    );
}

// Predefined skeleton components for common use cases
export function TaskCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 space-y-3">
            <Skeleton variant="text" width="70%" height="1.25rem" />
            <Skeleton variant="text" width="100%" height="0.875rem" />
            <Skeleton variant="text" width="50%" height="0.875rem" />
            <div className="flex gap-2 mt-4">
                <Skeleton variant="rectangular" width="60px" height="24px" />
                <Skeleton variant="rectangular" width="80px" height="24px" />
            </div>
        </div>
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="p-5 rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/30 to-transparent space-y-3">
            <Skeleton variant="text" width="60%" height="0.875rem" />
            <Skeleton variant="text" width="40px" height="2rem" />
            <Skeleton variant="rectangular" width="100%" height="4px" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton variant="circular" width="48px" height="48px" />
                    <div className="space-y-2">
                        <Skeleton variant="text" width="200px" height="1.5rem" />
                        <Skeleton variant="text" width="150px" height="0.875rem" />
                    </div>
                </div>
                <Skeleton variant="rectangular" width="200px" height="48px" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 space-y-4">
                        <Skeleton variant="text" width="60%" height="1.25rem" />
                        <Skeleton variant="text" lines={3} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 flex items-center gap-4">
                    <Skeleton variant="circular" width="40px" height="40px" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width={i % 2 === 0 ? "80%" : "60%"} height="1rem" />
                        <Skeleton variant="text" width="40%" height="0.75rem" />
                    </div>
                    <Skeleton variant="rectangular" width="80px" height="32px" />
                </div>
            ))}
        </div>
    );
}

// Kanban Board Skeleton
export function KanbanBoardSkeleton() {
    const columns = ['Todo', 'In Progress', 'Review', 'Done'];
    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {columns.map((column, colIdx) => (
                <div key={column} className="flex-shrink-0 w-80 space-y-3">
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                        <div className="flex items-center gap-3">
                            <Skeleton variant="rectangular" width="12px" height="12px" className="rounded-full" />
                            <Skeleton variant="text" width="100px" height="1rem" />
                        </div>
                        <Skeleton variant="circular" width="24px" height="24px" />
                    </div>
                    {/* Column Cards */}
                    <div className="space-y-3">
                        {Array.from({ length: colIdx === 0 ? 3 : colIdx === 1 ? 2 : colIdx === 2 ? 1 : 4 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 space-y-3">
                                <Skeleton variant="text" width="85%" height="1.125rem" />
                                <Skeleton variant="text" width="100%" height="0.875rem" />
                                <Skeleton variant="text" width="60%" height="0.875rem" />
                                <div className="flex items-center justify-between pt-2">
                                    <Skeleton variant="rectangular" width="60px" height="24px" />
                                    <Skeleton variant="circular" width="24px" height="24px" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Notifications Skeleton
export function NotificationsSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                        <Skeleton variant="circular" width="40px" height="40px" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton variant="text" width={i % 2 === 0 ? "60%" : "80%"} height="1rem" />
                                <Skeleton variant="text" width="60px" height="0.75rem" />
                            </div>
                            <Skeleton variant="text" width="100%" height="0.875rem" />
                            <Skeleton variant="text" width="70%" height="0.875rem" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
