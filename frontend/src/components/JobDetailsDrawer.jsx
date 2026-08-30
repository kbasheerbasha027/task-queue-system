import { AlertCircle, CheckCircle, Copy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { calculateDuration, formatTimestamp } from '../utils/dataHelpers';
import { JobTimeline } from './JobTimeline';
import { LoadingSkeleton } from './LoadingSkeleton';

export function JobDetailsDrawer({ jobId, isOpen, onClose }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getJobById(jobId);
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    const id = window.setInterval(fetchJob, 3000);
    return () => window.clearInterval(id);
  }, [jobId, isOpen]);

  if (!isOpen) return null;

  const duration = job?.started_at && job?.completed_at
    ? calculateDuration(job.started_at, job.completed_at)
    : job?.started_at && job?.status === 'RUNNING'
      ? calculateDuration(job.started_at, new Date().toISOString())
      : null;

  const fields = job
    ? [
        { label: 'Job ID', value: job.id, mono: true },
        { label: 'Task Name', value: job.name },
        { label: 'Status', value: job.status },
        { label: 'Queue', value: job.queue_name || 'default' },
        { label: 'Worker', value: job.worker_id || 'Not assigned' },
        { label: 'Priority', value: job.priority ?? 0 },
        { label: 'Retry Count', value: job.retries ?? 0 },
        { label: 'Max Retries', value: job.max_retries ?? 3 },
        { label: 'Created', value: formatTimestamp(job.created_at) },
        { label: 'Started', value: formatTimestamp(job.started_at) },
        { label: 'Completed', value: formatTimestamp(job.completed_at) },
        { label: 'Duration', value: duration || 'Not available' },
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="drawer-enter fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-blue-500/20 bg-slate-950/98 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-blue-500/15 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Job Details</h2>
            <p className="mt-0.5 font-mono text-xs text-slate-400">{jobId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-700/60 p-2 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {loading && !job && <LoadingSkeleton rows={6} />}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {job && (
            <>
              <div className={`rounded-xl border p-4 ${
                job.status === 'COMPLETED' ? 'border-emerald-500/30 bg-emerald-500/8' :
                job.status === 'FAILED' ? 'border-red-500/30 bg-red-500/8' :
                job.status === 'RUNNING' ? 'border-cyan-500/30 bg-cyan-500/8' :
                'border-amber-500/30 bg-amber-500/8'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="mt-1 text-2xl font-bold text-white">{job.status}</p>
                  </div>
                  {job.status === 'COMPLETED' && <CheckCircle className="h-8 w-8 text-emerald-400" />}
                  {job.status === 'FAILED' && <AlertCircle className="h-8 w-8 text-red-400" />}
                  {job.status === 'RUNNING' && <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {fields.map(({ label, value, mono }) => (
                  <div key={label} className="rounded-lg border border-blue-500/10 bg-slate-900/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                    <p className={`mt-1 text-sm text-slate-200 ${mono ? 'font-mono text-xs break-all' : ''}`}>{String(value)}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Execution Timeline</h3>
                <JobTimeline job={job} />
              </div>

              {job.payload && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Payload</h3>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-blue-500/10 bg-slate-900/60 p-3 font-mono text-[11px] text-slate-300">
                    {JSON.stringify(job.payload, null, 2)}
                  </pre>
                </div>
              )}

              {job.result && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Result</h3>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 font-mono text-[11px] text-emerald-300">
                    {JSON.stringify(job.result, null, 2)}
                  </pre>
                </div>
              )}

              {job.error && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Error</h3>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-red-500/20 bg-red-500/5 p-3 font-mono text-[11px] text-red-300">
                    {job.error}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {job && (
          <div className="border-t border-blue-500/10 p-4 flex gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(jobId)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/30"
            >
              <Copy className="h-4 w-4" />
              Copy ID
            </button>
            {job.status === 'PENDING' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.cancelJob(jobId);
                    onClose();
                    window.dispatchEvent(new Event('queue-refresh'));
                  } catch (err) {
                    setError(err.message);
                  }
                }}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
