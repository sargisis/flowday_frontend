interface ListSkeletonProps {
  count?: number;
  height?: string;
}

export default function ListSkeleton({ count = 5, height = 'h-16' }: ListSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 rounded-xl border border-zinc-700/30`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div className="h-full px-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-700/50 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-700/50 rounded w-3/4" />
              <div className="h-2 bg-zinc-700/30 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
