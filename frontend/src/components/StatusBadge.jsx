const variants = {
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  RUNNING: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  COMPLETED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  FAILED: 'border-red-500/30 bg-red-500/10 text-red-200',
  RETRYING: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  default: 'border-slate-600 bg-slate-800 text-slate-200',
};

export function StatusBadge({ status }) {
  const normalized = (status || 'default').toString().toUpperCase();
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${variants[normalized] || variants.default}`}>
      {normalized}
    </span>
  );
}
