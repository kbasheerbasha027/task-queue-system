import { Plus } from 'lucide-react';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <div className="mb-4 rounded-full border border-slate-700 bg-slate-950 p-3 text-cyan-400">
        <Plus className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
