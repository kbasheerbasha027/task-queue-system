import { Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';

export function JobTimeline({ job = {} }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return 'Invalid';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return null;
    const diff = new Date(end) - new Date(start);
    if (diff < 1000) return `${Math.round(diff)}ms`;
    return `${(diff / 1000).toFixed(2)}s`;
  };

  // Build timeline events
  const events = [];

  // Created event
  if (job.created_at) {
    events.push({
      id: 'created',
      stage: 'Created',
      timestamp: job.created_at,
      icon: Clock,
      color: 'cyan',
      durationFrom: null,
    });
  }

  // Queued (assume immediately after created)
  if (job.created_at) {
    events.push({
      id: 'queued',
      stage: 'Queued',
      timestamp: job.created_at,
      icon: Clock,
      color: 'blue',
      durationFrom: job.created_at,
    });
  }

  // Started
  if (job.started_at) {
    events.push({
      id: 'started',
      stage: 'Worker Assigned',
      timestamp: job.started_at,
      worker: job.worker_id,
      icon: Play,
      color: 'purple',
      durationFrom: job.created_at,
    });
  }

  // Completed or Failed
  if (job.completed_at) {
    const isCompleted = job.status === 'COMPLETED';
    events.push({
      id: 'completed',
      stage: isCompleted ? 'Completed' : 'Failed',
      timestamp: job.completed_at,
      icon: isCompleted ? CheckCircle : AlertCircle,
      color: isCompleted ? 'emerald' : 'red',
      durationFrom: job.started_at || job.created_at,
    });
  } else if (job.status === 'RUNNING') {
    events.push({
      id: 'running',
      stage: 'Running',
      timestamp: new Date().toISOString(),
      icon: () => <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />,
      color: 'cyan',
      durationFrom: job.started_at,
    });
  } else if (job.status === 'PENDING') {
    // Still pending
  }

  const getColorClasses = (color) => {
    const colors = {
      cyan: { border: 'border-cyan-500', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400', text: 'text-cyan-300' },
      blue: { border: 'border-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-400', text: 'text-blue-300' },
      purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-400', text: 'text-purple-300' },
      emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', text: 'text-emerald-300' },
      red: { border: 'border-red-500', bg: 'bg-red-500/10', dot: 'bg-red-400', text: 'text-red-300' },
    };
    return colors[color] || colors.slate;
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-sm text-slate-400 text-center">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent" />

        {/* Timeline events */}
        <div className="space-y-4">
          {events.map((event, idx) => {
            const colors = getColorClasses(event.color);
            const duration = calculateDuration(event.durationFrom, event.timestamp);

            return (
              <div key={event.id} className="relative pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-2 h-7 w-7 rounded-full border-2 ${colors.border} ${colors.bg} flex items-center justify-center bg-gradient-to-br`}>
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 animate-pulse" />
                </div>

                {/* Event card */}
                <div className={`rounded-lg border ${colors.border}/30 ${colors.bg} backdrop-blur-sm p-4 transition hover:border-opacity-50`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-bold ${colors.text}`}>{event.stage}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(event.timestamp)}
                      </p>
                      {event.worker && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          {event.worker}
                        </p>
                      )}
                    </div>
                    {duration && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Duration</p>
                        <p className={`text-sm font-mono font-bold ${colors.text} mt-1`}>
                          {duration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
