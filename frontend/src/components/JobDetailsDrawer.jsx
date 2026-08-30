import { X, Clock, FileText, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { JobTimeline } from './JobTimeline';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

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
  }, [jobId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-2xl z-50 border-l border-blue-500/20 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-blue-500/10 overflow-y-auto"
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-50 border-b border-blue-500/20 bg-gradient-to-b from-slate-900 to-slate-900/80 px-6 py-4 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Job Details</h2>
            <p className="text-sm text-slate-400 mt-1 font-mono">{jobId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {job && (
            <>
              {/* Status */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="text-2xl font-bold text-white mt-1">{job.status}</p>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-4 py-2 border ${
                    job.status === 'COMPLETED'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : job.status === 'FAILED'
                      ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : job.status === 'RUNNING'
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  }`}>
                    {job.status === 'COMPLETED' && <CheckCircle className="h-4 w-4" />}
                    {job.status === 'FAILED' && <AlertCircle className="h-4 w-4" />}
                    {job.status === 'RUNNING' && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Task Name</p>
                    <p className="text-sm font-mono text-cyan-300 mt-1 truncate">{job.name}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Queue</p>
                    <p className="text-sm font-mono text-blue-300 mt-1">{job.queue_name || 'default'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Priority</p>
                    <p className="text-sm font-mono text-purple-300 mt-1">{job.priority || 0}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Worker</p>
                    <p className="text-sm font-mono text-slate-300 mt-1">{job.worker_id || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Execution Timeline</h3>
                <JobTimeline job={job} />
              </div>

              {/* Payload */}
              {job.payload && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payload</h3>
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(job.payload, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Result */}
              {job.result && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Result</h3>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(job.result, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Error */}
              {job.error && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Error</h3>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-300 overflow-x-auto max-h-48">
                    <pre>{job.error}</pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/30">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jobId);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-slate-700"
                >
                  <Copy className="h-4 w-4" />
                  Copy Job ID
                </button>
                
                {job.status === 'PENDING' && (
                  <button
                    onClick={async () => {
                      try {
                        await api.cancelJob(jobId);
                        onClose();
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                    className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/50 hover:bg-red-500/20"
                  >
                    Cancel Job
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
