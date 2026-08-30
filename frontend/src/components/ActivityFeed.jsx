import { Activity, AlertCircle, CheckCircle, Clock, Play, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { deriveActivityEvents, formatRelativeTime, formatShortId } from '../utils/dataHelpers';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Panel } from './Panel';

const TYPE_CONFIG = {
  job_completed: { Icon: CheckCircle, colors: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', label: 'Job completed' },
  job_failed: { Icon: AlertCircle, colors: 'border-red-500/30 bg-red-500/10 text-red-300', label: 'Job failed' },
  job_running: { Icon: Play, colors: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300', label: 'Job running' },
  worker_started: { Icon: Play, colors: 'border-blue-500/30 bg-blue-500/10 text-blue-300', label: 'Worker started' },
  job_queued: { Icon: Clock, colors: 'border-amber-500/30 bg-amber-500/10 text-amber-300', label: 'Job queued' },
  job_submitted: { Icon: Plus, colors: 'border-purple-500/30 bg-purple-500/10 text-purple-300', label: 'Job submitted' },
};

export function ActivityFeed({ limit = 20, pollInterval = 4000 }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newIds, setNewIds] = useState(new Set());
  const prevIdsRef = useRef(new Set());

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await api.getJobs({ limit: 50 });
      const list = data.jobs || [];
      const eventIds = deriveActivityEvents(list).map((e) => e.id);
      const fresh = new Set();
      eventIds.forEach((id) => {
        if (!prevIdsRef.current.has(id) && prevIdsRef.current.size > 0) fresh.add(id);
      });
      prevIdsRef.current = new Set(eventIds);
      setNewIds(fresh);
      setJobs(list);
      if (fresh.size > 0) {
        window.setTimeout(() => setNewIds(new Set()), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to load activity');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
    const id = window.setInterval(() => load(true), pollInterval);
    const onRefresh = () => load(true);
    window.addEventListener('queue-refresh', onRefresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('queue-refresh', onRefresh);
    };
  }, [pollInterval]);

  const activities = useMemo(
    () => deriveActivityEvents(jobs).slice(0, limit),
    [jobs, limit],
  );

  return (
    <Panel glow="cyan" className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          Live
        </span>
      </div>

      {error && <ErrorState message={error} onRetry={() => load(false)} />}
      {loading && !activities.length && <LoadingSkeleton rows={5} />}
      {!loading && !error && activities.length === 0 && (
        <EmptyState title="No activity yet" description="Submit a job to see live events appear here." />
      )}

      <div className="custom-scrollbar max-h-[28rem] space-y-2 overflow-y-auto">
        {activities.map((activity, idx) => {
          const config = TYPE_CONFIG[activity.type] || { Icon: Activity, colors: 'border-slate-500/30 bg-slate-500/10 text-slate-300', label: activity.type };
          const { Icon } = config;
          const isNew = newIds.has(activity.id);

          return (
            <div
              key={activity.id}
              className={`activity-enter rounded-lg border p-3.5 transition ${config.colors.split(' ').slice(0, 2).join(' ')} ${isNew ? 'ring-1 ring-cyan-400/40' : ''}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${config.colors}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{config.label}</p>
                      <p className="mt-0.5 text-sm text-slate-200">{activity.message}</p>
                    </div>
                    <span className="flex-shrink-0 whitespace-nowrap text-[10px] text-slate-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                    <span className="font-mono text-cyan-300/90">{formatShortId(activity.jobId)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{activity.task}</span>
                    {activity.worker && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">{activity.worker}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
