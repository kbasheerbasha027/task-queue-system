export function LoadingSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl border border-blue-500/10 bg-slate-800/40"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-blue-500/10 bg-slate-900/60 p-6">
      <div className="h-3 w-24 rounded bg-slate-700/60" />
      <div className="mt-4 h-10 w-20 rounded bg-slate-700/60" />
      <div className="mt-3 h-2 w-32 rounded bg-slate-700/40" />
    </div>
  );
}

export function TopologySkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-blue-500/15 bg-slate-900/60 p-8">
      <div className="mx-auto h-4 w-48 rounded bg-slate-700/60" />
      <div className="mx-auto mt-8 flex flex-col items-center gap-6">
        <div className="h-12 w-32 rounded-xl bg-slate-700/50" />
        <div className="h-16 w-0.5 bg-slate-700/40" />
        <div className="h-12 w-36 rounded-xl bg-slate-700/50" />
        <div className="h-16 w-0.5 bg-slate-700/40" />
        <div className="flex gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-16 rounded-full bg-slate-700/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
