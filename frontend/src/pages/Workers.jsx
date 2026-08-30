import { Activity, Cpu, HardDrive, Server, Zap } from 'lucide-react';
import { ErrorState, LoadingSpinner } from '../components';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

const workerCards = [
  { id: 'worker-1', status: 'Running', queue: 'default', currentJob: 'send_email', lastActivity: 'just now', uptime: '12h 34m' },
  { id: 'worker-2', status: 'Idle', queue: 'default', currentJob: '—', lastActivity: '2 min ago', uptime: '8h 22m' },
];

export function Workers() {
  const { data: metrics, loading, error, reload } = useApi(api.getMetrics, []);

  const workers = workerCards.map((worker) => ({
    ...worker,
    metrics: metrics || {},
  }));

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading) return <LoadingSpinner label="Loading workers..." />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Infrastructure</p>
        <h2 className="mt-2 text-4xl font-bold text-white">Worker Nodes</h2>
        <p className="mt-3 text-slate-400">Monitor active workers and their job processing status</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((worker) => (
          <div key={worker.id} className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition hover:border-slate-600/50">
            {/* Gradient glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Worker</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{worker.id}</h3>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  worker.status === 'Running'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-600/50 bg-slate-800/50 text-slate-300'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    worker.status === 'Running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {worker.status}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 px-3 py-2.5 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    Queue
                  </span>
                  <span className="font-medium text-white">{worker.queue}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 px-3 py-2.5 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Zap className="h-4 w-4 text-violet-400" />
                    Current Job
                  </span>
                  <span className="font-medium text-white">{worker.currentJob}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/40 px-3 py-2.5 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <Activity className="h-4 w-4 text-orange-400" />
                    Last Activity
                  </span>
                  <span className="font-medium text-white">{worker.lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm">
        <div className="absolute -right-40 -top-40 h-80 w-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 text-white">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Live Worker Summary</h3>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400" />
                <p className="text-sm font-semibold text-slate-400">Queue Depth</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-cyan-300">{metrics?.queue_depth ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">Messages waiting</p>
            </div>
            <div className="rounded-xl border border-slate-700/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-emerald-400" />
                <p className="text-sm font-semibold text-slate-400">Completed</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-emerald-300">{metrics?.status_breakdown?.COMPLETED ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">Processed successfully</p>
            </div>
            <div className="rounded-xl border border-slate-700/30 bg-gradient-to-br from-red-500/10 to-pink-500/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-400" />
                <p className="text-sm font-semibold text-slate-400">Failed</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-red-300">{metrics?.status_breakdown?.FAILED ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">Encountered errors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
