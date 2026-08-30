import { ArrowUpDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

function formatShortId(id) {
  if (!id) return '—';
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export function JobTable({ jobs = [], onRefresh, onJobClick }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
      <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-between border-b border-slate-700/30 bg-gradient-to-r from-slate-800/30 to-slate-900/30 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <span>Job Activity</span>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-purple-300 hover:text-purple-200 transition"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 text-xs uppercase tracking-[0.12em] text-slate-400 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4 font-semibold">Job ID</th>
              <th className="px-6 py-4 font-semibold">Task</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Priority</th>
              <th className="px-6 py-4 font-semibold">Queue</th>
              <th className="px-6 py-4 font-semibold">Worker</th>
              <th className="px-6 py-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No jobs available yet.
                </td>
              </tr>
            )}

            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onJobClick && onJobClick(job.id)}
                className="border-t border-slate-700/20 transition hover:bg-slate-800/50 cursor-pointer group"
              >
                <td className="px-6 py-4 font-mono text-xs text-cyan-300 group-hover:text-cyan-200">{formatShortId(job.id)}</td>
                <td className="px-6 py-4 text-slate-200 group-hover:text-white">{job.name || '—'}</td>
                <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                <td className="px-6 py-4 font-medium text-slate-300">{job.priority ?? 0}</td>
                <td className="px-6 py-4 text-slate-400">{job.queue_name || 'default'}</td>
                <td className="px-6 py-4 text-slate-400">{job.worker_id || '—'}</td>
                <td className="px-6 py-4 text-slate-400">{job.created_at ? new Date(job.created_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
