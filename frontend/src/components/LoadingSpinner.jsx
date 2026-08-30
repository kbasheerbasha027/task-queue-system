export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
      <span>{label}</span>
    </div>
  );
}
