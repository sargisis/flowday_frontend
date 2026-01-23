interface CardSkeletonProps {
  count?: number;
  columns?: number;
}

export default function CardSkeleton({ count = 6, columns = 3 }: CardSkeletonProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 rounded-2xl border border-zinc-700/30 p-6"
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-zinc-700/50 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-700/30 rounded w-1/2" />
            </div>
            <div className="w-8 h-8 bg-zinc-700/50 rounded-lg" />
          </div>

          {/* Content */}
          <div className="space-y-2 mb-4">
            <div className="h-2 bg-zinc-700/30 rounded w-full" />
            <div className="h-2 bg-zinc-700/30 rounded w-4/5" />
            <div className="h-2 bg-zinc-700/30 rounded w-3/5" />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2">
            <div className="h-6 bg-zinc-700/50 rounded-full w-16" />
            <div className="h-6 bg-zinc-700/50 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
