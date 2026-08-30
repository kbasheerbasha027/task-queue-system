import { Zap } from 'lucide-react';
import { formatShortId } from '../utils/dataHelpers';
import { Panel } from './Panel';

export function QueueVisualization({ queueStats, metrics = null }) {
  const stats = queueStats || {
    name: 'default',
    depth: metrics?.queue_depth ?? 0,
    waiting: metrics?.status_breakdown?.PENDING ?? 0,
    active: metrics?.status_breakdown?.RUNNING ?? 0,
    completed: metrics?.status_breakdown?.COMPLETED ?? 0,
    failed: metrics?.status_breakdown?.FAILED ?? 0,
    avgExecution: metrics?.average_execution_time_seconds ?? null,
    successRate: metrics?.success_rate ?? null,
    pendingJobs: [],
  };

  const pressureLevel = stats.depth === 0 ? 'IDLE' : stats.depth < 5 ? 'LOW' : stats.depth < 15 ? 'MEDIUM' : 'HIGH';
  const pressureColor = {
    IDLE: 'text-slate-300',
    LOW: 'text-emerald-300',
    MEDIUM: 'text-amber-300',
    HIGH: 'text-red-300',
  }[pressureLevel];

  const fillPct = Math.min((stats.depth / Math.max(stats.depth, 20)) * 100, 100);
  const pendingDisplay = (stats.pendingJobs || []).slice(0, 12);

  return (
    <Panel glow="blue" className="p-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-cyan-400" />
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Queue Pipeline</p>
          <h3 className="text-lg font-semibold text-white">Queue: {stats.name}</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Queue Depth', value: stats.depth },
          { label: 'Waiting', value: stats.waiting },
          { label: 'Active', value: stats.active },
          { label: 'Completed', value: stats.completed },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-blue-500/20 bg-slate-950/35 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Pressure</span>
          <span className={`font-semibold ${pressureColor}`}>{pressureLevel}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-blue-500/80 transition-all duration-700"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-400">Jobs in queue</p>
        {pendingDisplay.length === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-500/15 bg-slate-950/30 p-6 text-center text-sm text-slate-500">
            No jobs waiting in queue
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {pendingDisplay.map((job, i) => (
              <div
                key={job.id}
                className="queue-item-enter rounded-lg border border-blue-500/20 bg-cyan-500/5 p-2.5 text-center"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <p className="truncate font-mono text-[10px] text-cyan-300">{formatShortId(job.id)}</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">{job.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Failed</p>
          <p className="mt-1 text-lg font-bold text-red-300">{stats.failed}</p>
        </div>
        <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Avg Execution</p>
          <p className="mt-1 text-lg font-bold text-cyan-300">
            {stats.avgExecution != null ? `${stats.avgExecution}s` : 'Not available'}
          </p>
        </div>
        <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Success Rate</p>
          <p className="mt-1 text-lg font-bold text-emerald-300">
            {stats.successRate != null ? `${stats.successRate}%` : 'Not available'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-500/10 bg-slate-950/30 px-3 py-2 text-xs text-slate-500">
          Throughput: <span className="text-slate-400">Not available</span>
          <span className="ml-1 text-slate-600">(no historical API)</span>
        </div>
        <div className="rounded-xl border border-blue-500/10 bg-slate-950/30 px-3 py-2 text-xs text-slate-500">
          Processing rate: <span className="text-slate-400">Not available</span>
        </div>
      </div>
    </Panel>
  );
}
