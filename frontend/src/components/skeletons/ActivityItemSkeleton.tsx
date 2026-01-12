export const ActivityItemSkeleton = () => {
    return (
        <div className="flex items-start gap-3 py-3 animate-pulse">
            {/* Icon circle */}
            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full flex-shrink-0 bg-[length:200%_100%] animate-shimmer"></div>

            {/* Content */}
            <div className="flex-1 space-y-2">
                {/* Title */}
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" style={{ width: '70%' }}></div>

                {/* Subtitle */}
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer" style={{ width: '40%' }}></div>
            </div>

            {/* Timestamp */}
            <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
        </div>
    );
};
