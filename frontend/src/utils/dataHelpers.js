const DEFAULT_WORKER_IDS = ['worker-1', 'worker-2', 'worker-3'];

export function formatShortId(id) {
  if (!id) return '—';
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export function formatTimestamp(value) {
  if (!value) return 'Not available';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Not available';
  }
}

export function formatRelativeTime(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60000) return `${Math.max(1, Math.round(diff / 1000))}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return new Date(value).toLocaleString();
}

export function calculateDuration(start, end) {
  if (!start || !end) return null;
  const diff = new Date(end) - new Date(start);
  if (diff < 1000) return `${Math.round(diff)}ms`;
  return `${(diff / 1000).toFixed(2)}s`;
}

export function deriveWorkers(jobs = []) {
  const workerMap = new Map();

  DEFAULT_WORKER_IDS.forEach((id) => {
    workerMap.set(id, {
      id,
      status: 'offline',
      queue: 'default',
      currentJob: null,
      currentTask: null,
      jobsCompleted: 0,
      jobsFailed: 0,
      lastActivity: null,
      latency: null,
    });
  });

  jobs.forEach((job) => {
    const workerId = job.worker_id;
    if (!workerId) return;

    if (!workerMap.has(workerId)) {
      workerMap.set(workerId, {
        id: workerId,
        status: 'offline',
        queue: job.queue_name || 'default',
        currentJob: null,
        currentTask: null,
        jobsCompleted: 0,
        jobsFailed: 0,
        lastActivity: null,
        latency: null,
      });
    }

    const worker = workerMap.get(workerId);
    worker.queue = job.queue_name || worker.queue || 'default';

    if (job.status === 'RUNNING') {
      worker.status = 'processing';
      worker.currentJob = job.id;
      worker.currentTask = job.name;
      worker.lastActivity = job.started_at || job.created_at;
    }

    if (job.status === 'COMPLETED') {
      worker.jobsCompleted += 1;
      const activityAt = job.completed_at || job.started_at;
      if (!worker.lastActivity || new Date(activityAt) > new Date(worker.lastActivity)) {
        worker.lastActivity = activityAt;
      }
      if (job.started_at && job.completed_at) {
        worker.latency = calculateDuration(job.started_at, job.completed_at);
      }
    }

    if (job.status === 'FAILED') {
      worker.jobsFailed += 1;
      const activityAt = job.completed_at || job.started_at;
      if (!worker.lastActivity || new Date(activityAt) > new Date(worker.lastActivity)) {
        worker.lastActivity = activityAt;
      }
    }
  });

  workerMap.forEach((worker) => {
    if (worker.status === 'offline') {
      if (worker.jobsCompleted > 0 || worker.jobsFailed > 0) {
        worker.status = 'healthy';
      }
      const hasRecentRunning = jobs.some(
        (j) => j.worker_id === worker.id && j.status === 'RUNNING',
      );
      if (hasRecentRunning) worker.status = 'processing';
    }
    if (worker.status === 'healthy' && worker.jobsCompleted > 5) {
      worker.status = 'busy';
    }
  });

  return Array.from(workerMap.values());
}

export function getWorkerStatusLabel(status) {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'processing':
      return 'Processing';
    case 'busy':
      return 'Busy';
    case 'offline':
    default:
      return 'Offline';
  }
}

export function deriveActivityEvents(jobs = []) {
  const events = [];

  jobs.forEach((job) => {
    if (job.created_at) {
      events.push({
        id: `${job.id}-submitted`,
        timestamp: job.created_at,
        type: 'job_submitted',
        jobId: job.id,
        worker: null,
        task: job.name,
        message: 'Job submitted',
      });
    }

    if (job.status !== 'PENDING' || job.started_at) {
      events.push({
        id: `${job.id}-queued`,
        timestamp: job.created_at,
        type: 'job_queued',
        jobId: job.id,
        worker: null,
        task: job.name,
        message: `Queued on ${job.queue_name || 'default'}`,
      });
    }

    if (job.started_at) {
      events.push({
        id: `${job.id}-started`,
        timestamp: job.started_at,
        type: 'worker_started',
        jobId: job.id,
        worker: job.worker_id,
        task: job.name,
        message: 'Worker started processing',
      });
      events.push({
        id: `${job.id}-running`,
        timestamp: job.started_at,
        type: 'job_running',
        jobId: job.id,
        worker: job.worker_id,
        task: job.name,
        message: 'Job running',
      });
    }

    if (job.status === 'COMPLETED' && job.completed_at) {
      events.push({
        id: `${job.id}-completed`,
        timestamp: job.completed_at,
        type: 'job_completed',
        jobId: job.id,
        worker: job.worker_id,
        task: job.name,
        message: 'Job completed successfully',
      });
    }

    if (job.status === 'FAILED' && job.completed_at) {
      events.push({
        id: `${job.id}-failed`,
        timestamp: job.completed_at,
        type: 'job_failed',
        jobId: job.id,
        worker: job.worker_id,
        task: job.name,
        message: job.error || 'Job failed',
      });
    }

    if (job.status === 'RETRYING') {
      events.push({
        id: `${job.id}-retrying`,
        timestamp: job.started_at || job.created_at,
        type: 'job_failed',
        jobId: job.id,
        worker: job.worker_id,
        task: job.name,
        message: job.error ? `Retrying: ${job.error}` : 'Job retrying',
      });
    }
  });

  return events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50);
}

export function deriveNotifications(jobs = [], metrics = null) {
  const notifications = [];

  jobs.slice(0, 20).forEach((job) => {
    if (job.status === 'COMPLETED' && job.completed_at) {
      notifications.push({
        id: `notif-${job.id}-completed`,
        type: 'success',
        title: 'Job completed',
        message: `${job.name} (${formatShortId(job.id)}) finished on ${job.worker_id || 'worker'}`,
        timestamp: job.completed_at,
        read: false,
      });
    }
    if (job.status === 'FAILED' && job.completed_at) {
      notifications.push({
        id: `notif-${job.id}-failed`,
        type: 'error',
        title: 'Job failed',
        message: `${job.name}: ${job.error || 'Unknown error'}`,
        timestamp: job.completed_at,
        read: false,
      });
    }
    if (job.status === 'RUNNING' && job.started_at) {
      notifications.push({
        id: `notif-${job.id}-running`,
        type: 'info',
        title: 'Worker processing',
        message: `${job.worker_id || 'Worker'} started ${job.name}`,
        timestamp: job.started_at,
        read: true,
      });
    }
  });

  if (metrics?.queue_depth > 0) {
    notifications.push({
      id: 'notif-queue-depth',
      type: 'warning',
      title: 'Queue activity',
      message: `${metrics.queue_depth} job(s) waiting in default queue`,
      timestamp: metrics.timestamp || new Date().toISOString(),
      read: false,
    });
  }

  return notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 30);
}

export function deriveQueueStats(jobs = [], metrics = null) {
  const breakdown = metrics?.status_breakdown || {};
  const pendingJobs = jobs.filter((j) => j.status === 'PENDING');
  const runningJobs = jobs.filter((j) => j.status === 'RUNNING');

  return {
    name: 'default',
    depth: metrics?.queue_depth ?? pendingJobs.length,
    waiting: breakdown.PENDING ?? pendingJobs.length,
    active: breakdown.RUNNING ?? runningJobs.length,
    completed: breakdown.COMPLETED ?? jobs.filter((j) => j.status === 'COMPLETED').length,
    failed: breakdown.FAILED ?? jobs.filter((j) => j.status === 'FAILED').length,
    avgExecution: metrics?.average_execution_time_seconds ?? null,
    successRate: metrics?.success_rate ?? null,
    pendingJobs,
    runningJobs,
  };
}

export function deriveLogEntries(jobs = []) {
  return deriveActivityEvents(jobs).map((event) => ({
    timestamp: formatTimestamp(event.timestamp),
    service: event.worker ? 'worker' : 'api',
    worker: event.worker || '—',
    level: event.type === 'job_failed' ? 'ERROR' : event.type === 'job_completed' ? 'INFO' : 'INFO',
    message: `[${event.type.replace(/_/g, ' ')}] ${event.task} · ${formatShortId(event.jobId)}`,
    highlight: event.type === 'job_failed',
  }));
}

const STATUS_COLORS = {
  COMPLETED: '#10b981',
  PENDING: '#f59e0b',
  FAILED: '#ef4444',
  RUNNING: '#06b6d4',
  RETRYING: '#8b5cf6',
};

export function statusBreakdownToChart(breakdown = {}) {
  return Object.entries(breakdown).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#94a3b8',
  }));
}
