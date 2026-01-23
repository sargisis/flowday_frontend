interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 10, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-800/30">
        <div className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-3 bg-zinc-700/50 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/30">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-2.5 bg-zinc-700/30 rounded animate-pulse"
                style={{
                  animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`,
                  width: colIndex === 0 ? '80%' : '100%'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
