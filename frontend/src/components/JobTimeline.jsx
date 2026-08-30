import { AlertCircle, CheckCircle, Clock, Play } from 'lucide-react';
import { calculateDuration, formatTimestamp } from '../utils/dataHelpers';

const STAGE_CONFIG = {
  Created: { color: 'cyan', Icon: Clock },
  Queued: { color: 'blue', Icon: Clock },
  'Worker Assigned': { color: 'purple', Icon: Play },
  Running: { color: 'cyan', Icon: Play },
  Completed: { color: 'emerald', Icon: CheckCircle },
  Failed: { color: 'red', Icon: AlertCircle },
};

const COLOR_MAP = {
  cyan: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400', text: 'text-cyan-300', glow: 'shadow-[0_0_12px_rgba(34,211,238,0.4)]' },
  blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', dot: 'bg-blue-400', text: 'text-blue-300', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]' },
  purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', dot: 'bg-purple-400', text: 'text-purple-300', glow: '' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', text: 'text-emerald-300', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
  red: { border: 'border-red-500/40', bg: 'bg-red-500/10', dot: 'bg-red-400', text: 'text-red-300', glow: '' },
};

export function JobTimeline({ job = {} }) {
  const events = [];

  if (job.created_at) {
    events.push({ stage: 'Created', timestamp: job.created_at, worker: null, durationFrom: null });
  }
  if (job.created_at) {
    events.push({ stage: 'Queued', timestamp: job.created_at, worker: null, durationFrom: job.created_at });
  }
  if (job.started_at) {
    events.push({
      stage: 'Worker Assigned',
      timestamp: job.started_at,
      worker: job.worker_id,
      durationFrom: job.created_at,
    });
    if (job.status === 'RUNNING') {
      events.push({
        stage: 'Running',
        timestamp: job.started_at,
        worker: job.worker_id,
        durationFrom: job.started_at,
        active: true,
      });
    }
  }
  if (job.completed_at) {
    events.push({
      stage: job.status === 'FAILED' ? 'Failed' : 'Completed',
      timestamp: job.completed_at,
      worker: job.worker_id,
      durationFrom: job.started_at || job.created_at,
    });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-blue-500/15 p-4 text-center text-sm text-slate-500">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="relative pl-2">
      <div className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/30 to-transparent" />
      <div className="space-y-4">
        {events.map((event, idx) => {
          const config = STAGE_CONFIG[event.stage] || STAGE_CONFIG.Created;
          const colors = COLOR_MAP[config.color] || COLOR_MAP.cyan;
          const duration = event.durationFrom ? calculateDuration(event.durationFrom, event.timestamp) : null;
          const { Icon } = config;

          return (
            <div key={`${event.stage}-${idx}`} className="timeline-node-enter relative flex gap-4 pl-8" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg} ${colors.glow} ${event.active ? 'animate-pulse' : ''}`}>
                <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
              </div>
              <div className={`flex-1 rounded-lg border ${colors.border}/25 ${colors.bg} p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${colors.text}`}>{event.stage}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatTimestamp(event.timestamp)}</p>
                    {event.worker && (
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">{event.worker}</p>
                    )}
                  </div>
                  {duration && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">Duration</p>
                      <p className={`font-mono text-xs font-semibold ${colors.text}`}>{duration}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
