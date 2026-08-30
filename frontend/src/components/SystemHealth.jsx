import { Database, Server, Signal, Zap } from 'lucide-react';
import { deriveWorkers } from '../utils/dataHelpers';
import { Panel } from './Panel';

export function SystemHealth({ health = {}, jobs = [] }) {
  const workers = deriveWorkers(jobs);
  const processingCount = workers.filter((w) => w.status === 'processing').length;
  const offlineCount = workers.filter((w) => w.status === 'offline').length;

  let workerState = 'Healthy';
  let workerTone = 'emerald';
  if (processingCount > 0) {
    workerState = `${processingCount} processing`;
    workerTone = 'cyan';
  } else if (offlineCount === workers.length) {
    workerState = 'No activity';
    workerTone = 'slate';
  }

  const services = [
    {
      key: 'api',
      label: 'API Server',
      Icon: Signal,
      ok: health?.status === 'healthy',
      state: health?.status === 'healthy' ? 'Connected' : 'Disconnected',
    },
    {
      key: 'database',
      label: 'PostgreSQL',
      Icon: Database,
      ok: health?.database === 'connected',
      state: health?.database === 'connected' ? 'Connected' : 'Disconnected',
    },
    {
      key: 'redis',
      label: 'Redis Queue',
      Icon: Server,
      ok: health?.redis === 'connected',
      state: health?.redis === 'connected' ? 'Connected' : 'Disconnected',
    },
    {
      key: 'workers',
      label: 'Worker Pool',
      Icon: Zap,
      ok: offlineCount < workers.length,
      state: workerState,
      tone: workerTone,
    },
  ];

  const allOk = services.every((s) => s.ok);

  return (
    <Panel glow={allOk ? 'emerald' : 'amber'} className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${allOk ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <h3 className="text-lg font-semibold text-white">System Status</h3>
      </div>

      <div className="space-y-2.5">
        {services.map(({ key, label, Icon, ok, state, tone }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-blue-400/80" />
              <span className="text-sm text-slate-300">{label}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                ok
                  ? tone === 'cyan'
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : tone === 'slate'
                    ? 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${ok ? (tone === 'cyan' ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400') : 'bg-red-400'}`} />
              {state}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
