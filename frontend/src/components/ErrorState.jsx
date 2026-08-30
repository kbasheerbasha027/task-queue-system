import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <div>
          <p className="font-semibold">Unable to connect to the backend</p>
          <p className="mt-1 text-sm text-red-200/80">{message || 'Make sure the Flask API is running on port 5000.'}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:border-red-300 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}
