export const TaskCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="space-y-3 animate-pulse">
                {/* Title */}
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" style={{ width: '80%' }}></div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" style={{ width: '90%' }}></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" style={{ width: '60%' }}></div>
                </div>

                {/* Metadata badges */}
                <div className="flex gap-2 items-center">
                    <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer"></div>
                </div>
            </div>
        </div>
    );
};
