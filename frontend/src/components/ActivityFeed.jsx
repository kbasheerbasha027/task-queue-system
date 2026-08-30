import { Activity, CheckCircle, AlertCircle, Play, StopCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ActivityFeed() {
  const [activities, setActivities] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2000),
      type: 'job_completed',
      worker: 'worker-1',
      job: '7def4c9...',
      task: 'send_email',
      message: 'completed send_email',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5000),
      type: 'job_started',
      worker: 'worker-2',
      job: 'a1b2c3d...',
      task: 'process_image',
      message: 'started processing job',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 8000),
      type: 'job_queued',
      worker: null,
      job: 'x9y8z7w...',
      task: 'backup_data',
      message: 'entered default queue',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 12000),
      type: 'job_submitted',
      worker: null,
      job: 'q1w2e3r...',
      task: 'generate_report',
      message: 'new job submitted',
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'job_completed':
        return CheckCircle;
      case 'job_failed':
        return AlertCircle;
      case 'job_started':
        return Play;
      case 'job_queued':
        return Plus;
      default:
        return Activity;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'job_completed':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' };
      case 'job_failed':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400' };
      case 'job_started':
        return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' };
      case 'job_queued':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-400' };
      default:
        return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400' };
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 backdrop-blur-xl">
      {/* Animated background gradient */}
      <div className="absolute -left-32 -bottom-32 h-64 w-64 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
            <h3 className="text-lg font-bold text-white">Live Activity Stream</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Activity list */}
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {activities.length === 0 ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center text-sm text-slate-400">
              No recent activity
            </div>
          ) : (
            activities.map((activity, idx) => {
              const Icon = getIcon(activity.type);
              const colors = getTypeColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className={`rounded-lg border ${colors.border} ${colors.bg} p-4 transition hover:${colors.border.replace('/30', '/50')} group`}
                  style={{
                    animation: `slideInUp 0.4s ease-out`,
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colors.bg} border ${colors.border}`}>
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-slate-300">
                            <span className="font-mono font-bold text-slate-200">{activity.worker}</span>
                            {activity.worker && ' '}
                            <span className={colors.text}>{activity.message}</span>
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-xs">
                            <span className="font-mono text-blue-300/80">Job {activity.job}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{activity.task}</span>
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700/30 text-center text-xs text-slate-400">
          Showing last 50 events • Updates every 2s
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.6);
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
