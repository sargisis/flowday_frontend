import { Skeleton } from "./SkeletonLoader";

export function MessagesSkeleton() {
    return (
        <div className="h-full flex p-4 lg:p-6 overflow-hidden">
            <div className="flex-1 flex bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                {/* Conversations Sidebar Skeleton */}
                <aside className="w-full md:w-80 border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5 space-y-4">
                        <Skeleton variant="text" width="120px" height="1.5rem" />
                        <Skeleton variant="rectangular" width="100%" height="40px" />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg">
                                <Skeleton variant="circular" width="48px" height="48px" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="text" width={i % 2 === 0 ? "70%" : "90%"} height="1rem" />
                                    <Skeleton variant="text" width="50%" height="0.75rem" />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Chat Area Skeleton */}
                <div className="flex-1 flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                        <Skeleton variant="circular" width="40px" height="40px" />
                        <div className="flex-1 space-y-1">
                            <Skeleton variant="text" width="150px" height="1rem" />
                            <Skeleton variant="text" width="100px" height="0.75rem" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                {i % 2 !== 0 && <Skeleton variant="circular" width="32px" height="32px" />}
                                <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <Skeleton variant="rectangular" width={i % 2 === 0 ? "200px" : "180px"} height="60px" className="rounded-2xl" />
                                    <Skeleton variant="text" width="60px" height="0.625rem" />
                                </div>
                                {i % 2 === 0 && <Skeleton variant="circular" width="32px" height="32px" />}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <Skeleton variant="rectangular" width="100%" height="50px" className="rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
