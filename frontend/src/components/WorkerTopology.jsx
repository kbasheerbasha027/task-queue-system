import { Panel } from './Panel';
import { deriveWorkers, formatShortId, getWorkerStatusLabel } from '../utils/dataHelpers';

const STATUS_STYLES = {
  healthy: {
    ring: 'border-emerald-400/50 bg-emerald-500/10',
    dot: 'bg-emerald-400',
    label: 'text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
  },
  processing: {
    ring: 'border-cyan-400/50 bg-cyan-500/10',
    dot: 'bg-cyan-400',
    label: 'text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
  },
  busy: {
    ring: 'border-amber-400/50 bg-amber-500/10',
    dot: 'bg-amber-400',
    label: 'text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  offline: {
    ring: 'border-red-400/40 bg-red-500/5',
    dot: 'bg-red-400/70',
    label: 'text-red-300/80',
    glow: '',
  },
};

function ConnectionLine({ active = false, vertical = true, className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className={`${vertical ? 'h-12 w-px' : 'h-px w-full min-w-[2rem]'} bg-gradient-to-b from-cyan-500/40 via-blue-500/30 to-cyan-500/10`}
      />
      {active && (
        <div className="topology-pulse absolute h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
      )}
    </div>
  );
}

export function WorkerTopology({ jobs = [], metrics = null, health = null, queueDepth = 0 }) {
  const workers = deriveWorkers(jobs);
  const onlineCount = workers.filter((w) => w.status !== 'offline').length;
  const hasRunning = jobs.some((j) => j.status === 'RUNNING');
  const apiHealthy = health?.status === 'healthy';
  const redisConnected = health?.redis === 'connected';

  return (
    <Panel glow="cyan" className="p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">Infrastructure</p>
          <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Distributed System Topology</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 px-3 py-1.5 text-xs text-cyan-200">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {onlineCount} / {workers.length} workers active
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className={`topology-node rounded-xl border px-6 py-3 ${apiHealthy ? 'border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.15)]' : 'border-red-400/40 bg-red-500/10'}`}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Layer 1</p>
          <p className="mt-1 text-sm font-bold text-white">API SERVER</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{apiHealthy ? 'Flask · Port 5000' : 'Unreachable'}</p>
        </div>

        <ConnectionLine active={apiHealthy} />

        <div className={`topology-node rounded-xl border px-8 py-3 ${redisConnected ? 'border-blue-400/40 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.15)]' : 'border-red-400/40 bg-red-500/10'}`}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Layer 2</p>
          <p className="mt-1 text-sm font-bold text-white">REDIS QUEUE</p>
          <p className="mt-0.5 text-[10px] font-mono text-cyan-300">
            Depth: {metrics?.queue_depth ?? queueDepth ?? 0}
          </p>
        </div>

        <ConnectionLine active={hasRunning || queueDepth > 0} />

        <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {workers.map((worker, idx) => {
            const style = STATUS_STYLES[worker.status] || STATUS_STYLES.offline;
            const num = String(idx + 1).padStart(2, '0');

            return (
              <div key={worker.id} className="flex flex-col items-center">
                <div className={`hidden h-8 w-px bg-gradient-to-b from-blue-500/40 to-transparent sm:block ${worker.status === 'offline' ? 'opacity-30' : ''}`} />
                <div className={`topology-node relative flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full border-2 ${style.ring} ${style.glow} transition-all duration-500`}>
                  {worker.status === 'processing' && (
                    <span className="absolute inset-2 rounded-full border border-cyan-400/30 animate-ping opacity-40" />
                  )}
                  <span className="text-lg font-bold text-white">{num}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">{worker.id}</span>
                </div>
                <p className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] ${style.label}`}>
                  {getWorkerStatusLabel(worker.status)}
                </p>
                {worker.currentTask ? (
                  <p className="mt-1 max-w-[8rem] truncate text-center text-[10px] font-mono text-cyan-300/80">
                    {worker.currentTask}
                  </p>
                ) : worker.jobsCompleted > 0 ? (
                  <p className="mt-1 text-[10px] text-slate-500">{worker.jobsCompleted} completed</p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-600">Idle</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {workers.map((worker) => {
          const style = STATUS_STYLES[worker.status] || STATUS_STYLES.offline;
          return (
            <div key={`detail-${worker.id}`} className="rounded-xl border border-blue-500/10 bg-slate-950/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-white">{worker.id}</span>
                <span className={`flex items-center gap-1.5 ${style.label}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${worker.status === 'processing' ? 'animate-pulse' : ''}`} />
                  {getWorkerStatusLabel(worker.status)}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Current job</span>
                  <span className="font-mono text-slate-300">{worker.currentJob ? formatShortId(worker.currentJob) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="text-emerald-300">{worker.jobsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className="text-cyan-300">{worker.latency || 'Not available'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
