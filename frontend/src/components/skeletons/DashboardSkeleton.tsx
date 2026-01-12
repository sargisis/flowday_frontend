export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-5 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
                            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%] animate-shimmer"></div>
                        </div>
                        <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
                    </div>
                ))}
            </div>

            {/* Today's Tasks Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 bg-[length:200%_100%] animate-shimmer"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                            <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2 bg-[length:200%_100%] animate-shimmer" style={{ width: `${60 + i * 10}%` }}></div>
                                <div className="h-3 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 bg-[length:200%_100%] animate-shimmer"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full flex-shrink-0 bg-[length:200%_100%] animate-shimmer"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2 bg-[length:200%_100%] animate-shimmer" style={{ width: `${70 + i * 5}%` }}></div>
                                <div className="h-3 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
