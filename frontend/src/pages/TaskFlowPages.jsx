import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers3,
  Search,
  Server,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ActivityFeed,
  EmptyState,
  ErrorState,
  JobDetailsDrawer,
  JobTable,
  LoadingSkeleton,
  LoadingSpinner,
  MetricsChart,
  Panel,
  QueueVisualization,
  StatCard,
  StatCardSkeleton,
  SystemHealth,
  WorkerTopology,
} from '../components';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import {
  deriveLogEntries,
  deriveQueueStats,
  deriveWorkers,
  formatRelativeTime,
  formatShortId,
  formatTimestamp,
  getWorkerStatusLabel,
  statusBreakdownToChart,
} from '../utils/dataHelpers';

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function DashboardPage({ onOpenSubmit }) {
  const { data: metrics, loading: mLoading, error: mError, reload: reloadM } = usePolling(api.getMetrics, 5000);
  const { data: jobsData, loading: jLoading, error: jError, reload: reloadJ } = usePolling(async () => api.getJobs({ limit: 50 }), 5000);
  const { data: health, loading: hLoading, error: hError, reload: reloadH } = usePolling(api.getHealth, 15000);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const jobs = jobsData?.jobs || [];
  const breakdown = metrics?.status_breakdown || {};
  const queueStats = useMemo(() => deriveQueueStats(jobs, metrics), [jobs, metrics]);
  const chartData = statusBreakdownToChart(breakdown);

  const reloadAll = () => Promise.all([reloadM(), reloadJ(), reloadH()]);

  const initialLoad = (mLoading || jLoading) && !metrics;

  if (initialLoad) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={1} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}</div>
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (mError) return <ErrorState message={mError} onRetry={reloadAll} />;

  const kpiCards = [
    { title: 'Total Jobs', value: metrics?.total_jobs ?? 0, subtitle: 'All recorded tasks', accent: 'cyan', icon: Layers3 },
    { title: 'Queue Depth', value: metrics?.queue_depth ?? 0, subtitle: 'Redis backlog', accent: 'blue', icon: Server },
    { title: 'Success Rate', value: metrics?.success_rate != null ? `${metrics.success_rate}%` : 'N/A', subtitle: 'Completed vs failed', accent: 'emerald', icon: ShieldCheck },
    { title: 'Avg Execution', value: metrics?.average_execution_time_seconds != null ? `${metrics.average_execution_time_seconds}s` : 'N/A', subtitle: 'Mean job duration', accent: 'cyan', icon: Gauge },
    { title: 'Pending', value: breakdown.PENDING ?? 0, subtitle: 'Awaiting workers', accent: 'amber', icon: Clock3 },
    { title: 'Running', value: breakdown.RUNNING ?? 0, subtitle: 'In progress', accent: 'blue', icon: Activity },
    { title: 'Completed', value: breakdown.COMPLETED ?? 0, subtitle: 'Successful', accent: 'emerald', icon: CheckCircle2 },
    { title: 'Failed', value: breakdown.FAILED ?? 0, subtitle: 'Errors', accent: 'red', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Control Center"
        title="Infrastructure Command Center"
        description="Distributed topology, queue flow, and live task lifecycle — powered by real backend data."
        actions={
          <button type="button" onClick={reloadAll} className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2.5 text-sm font-medium text-cyan-100 hover:bg-cyan-500/12">
            Refresh
          </button>
        }
      />

      {/* System Status */}
      {hError ? (
        <ErrorState message={hError} onRetry={reloadH} />
      ) : hLoading && !health ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <SystemHealth health={health} jobs={jobs} />
      )}

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Distributed Topology — visual focus */}
      <WorkerTopology jobs={jobs} metrics={metrics} health={health} queueDepth={metrics?.queue_depth ?? 0} />

      {/* Queue + Worker Information */}
      <div className="grid gap-6 xl:grid-cols-2">
        <QueueVisualization queueStats={queueStats} metrics={metrics} />
        <Panel glow="blue" className="p-5">
          <h3 className="text-lg font-semibold text-white">Worker Summary</h3>
          <p className="mt-1 text-xs text-slate-400">Derived from job execution history</p>
          <div className="mt-4 space-y-2">
            {deriveWorkers(jobs).map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3 py-2.5 text-sm">
                <span className="font-mono text-white">{w.id}</span>
                <span className="text-slate-400">{getWorkerStatusLabel(w.status)}</span>
                <span className="text-emerald-300">{w.jobsCompleted} done</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Live Activity + Recent Jobs */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <ActivityFeed limit={15} />
        <Panel glow="cyan" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
            <button type="button" onClick={onOpenSubmit} className="rounded-lg border border-cyan-500/25 bg-cyan-500/8 px-3 py-1.5 text-xs text-cyan-200">
              Submit job
            </button>
          </div>
          {jError ? (
            <ErrorState message={jError} onRetry={reloadJ} />
          ) : jLoading && !jobs.length ? (
            <LoadingSpinner label="Loading jobs…" />
          ) : jobs.length ? (
            <JobTable
              jobs={jobs.slice(0, 8)}
              onRefresh={reloadJ}
              onJobClick={(id) => { setSelectedJobId(id); setDrawerOpen(true); }}
            />
          ) : (
            <EmptyState title="No jobs yet" description="Submit a task to begin." actionLabel="Submit Job" onAction={onOpenSubmit} />
          )}
        </Panel>
      </div>

      {/* Performance / Observability */}
      <MetricsChart title="Job Status Distribution" type="bar" data={chartData} />

      <JobDetailsDrawer
        jobId={selectedJobId}
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedJobId(null); }}
      />
    </div>
  );
}

export function JobsPage({ onOpenSubmit }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, loading, error, reload } = usePolling(async () => api.getJobs({ limit: 100 }), 5000);

  const jobs = useMemo(() => {
    return (data?.jobs || []).filter((job) => {
      const text = `${job.name || ''} ${job.id || ''}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase()))
        && (!status || job.status === status)
        && (!priority || String(job.priority ?? 0) === String(priority));
    });
  }, [data, query, status, priority]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Jobs"
        description="Execution history and task lifecycle."
        actions={
          <button type="button" onClick={onOpenSubmit} className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2.5 text-sm text-cyan-100">
            Submit job
          </button>
        }
      />

      <Panel glow="cyan" className="p-4">
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.9fr_0.9fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs or IDs…"
              className="w-full rounded-xl border border-blue-500/15 bg-slate-950/45 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-500/40"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-blue-500/15 bg-slate-950/45 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/40">
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="RUNNING">RUNNING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-blue-500/15 bg-slate-950/45 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/40">
            <option value="">All priorities</option>
            <option value="0">Low (0)</option>
            <option value="1">Normal (1)</option>
            <option value="2">High (2)</option>
            <option value="3">Critical (3)</option>
          </select>
        </div>
      </Panel>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !jobs.length ? (
        <LoadingSpinner label="Loading jobs…" />
      ) : jobs.length ? (
        <JobTable
          jobs={jobs}
          onRefresh={reload}
          onJobClick={(id) => { setSelectedJobId(id); setDrawerOpen(true); }}
        />
      ) : (
        <EmptyState title="No jobs found" description="Adjust filters or submit a new task." actionLabel="Submit Job" onAction={onOpenSubmit} />
      )}

      <JobDetailsDrawer
        jobId={selectedJobId}
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedJobId(null); }}
      />
    </div>
  );
}

export function QueuesPage() {
  const { data: metrics, loading: mLoading, error: mError, reload: reloadM } = usePolling(api.getMetrics, 5000);
  const { data: jobsData, loading: jLoading, error: jError, reload: reloadJ } = usePolling(async () => api.getJobs({ limit: 100 }), 5000);

  const jobs = jobsData?.jobs || [];
  const queueStats = useMemo(() => deriveQueueStats(jobs, metrics), [jobs, metrics]);

  if (mError) return <ErrorState message={mError} onRetry={reloadM} />;
  if ((mLoading || jLoading) && !metrics) return <LoadingSpinner label="Loading queue data…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Queue Fleet"
        title="Queue Monitoring"
        description="Real-time queue depth and job flow for the default queue."
      />
      <QueueVisualization queueStats={queueStats} metrics={metrics} />
      {jError && <ErrorState message={jError} onRetry={reloadJ} />}
      <Panel glow="blue" className="p-5">
        <h3 className="text-lg font-semibold text-white">Running Jobs</h3>
        {queueStats.runningJobs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No active jobs</p>
        ) : (
          <div className="mt-3 space-y-2">
            {queueStats.runningJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-sm">
                <span className="font-mono text-cyan-300">{formatShortId(job.id)}</span>
                <span className="text-slate-300">{job.name}</span>
                <span className="text-slate-500">{job.worker_id || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export function WorkersPage() {
  const { data: jobsData, loading: jLoading, error: jError, reload: reloadJ } = usePolling(async () => api.getJobs({ limit: 200 }), 5000);
  const { data: metrics } = usePolling(api.getMetrics, 5000);

  const jobs = jobsData?.jobs || [];
  const workers = deriveWorkers(jobs);
  const online = workers.filter((w) => w.status !== 'offline').length;

  const STATUS_BADGE = {
    healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    processing: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    busy: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    offline: 'border-red-500/30 bg-red-500/10 text-red-300',
  };

  if (jError) return <ErrorState message={jError} onRetry={reloadJ} />;
  if (jLoading && !jobs.length) return <LoadingSpinner label="Loading workers…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Execution"
        title="Worker Control Center"
        description="Worker status derived from job assignments. CPU/memory not exposed by API."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {online} / {workers.length} active
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((worker) => (
          <Panel key={worker.id} glow={worker.status === 'offline' ? 'red' : worker.status === 'processing' ? 'blue' : 'cyan'} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Worker</p>
                <p className="mt-1 text-xl font-semibold font-mono text-white">{worker.id}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${STATUS_BADGE[worker.status]}`}>
                {getWorkerStatusLabel(worker.status)}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ['Queue', worker.queue],
                ['Current Job', worker.currentJob ? formatShortId(worker.currentJob) : '—'],
                ['Current Task', worker.currentTask || '—'],
                ['Jobs Completed', worker.jobsCompleted],
                ['Last Activity', worker.lastActivity ? formatRelativeTime(worker.lastActivity) : 'Not available'],
                ['Latency', worker.latency || 'Not available'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between rounded-lg border border-blue-500/10 bg-slate-950/30 px-3 py-2">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel glow="blue" className="p-5">
        <h3 className="text-lg font-semibold text-white">Fleet Metrics</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard title="Queue Depth" value={metrics?.queue_depth ?? '—'} accent="blue" icon={Server} />
          <StatCard title="Completed" value={metrics?.status_breakdown?.COMPLETED ?? 0} accent="emerald" icon={CheckCircle2} />
          <StatCard title="Failed" value={metrics?.status_breakdown?.FAILED ?? 0} accent="red" icon={AlertTriangle} />
        </div>
      </Panel>
    </div>
  );
}

export function MonitoringPage() {
  const { data: metrics, loading, error, reload } = usePolling(api.getMetrics, 5000);
  const { data: health } = usePolling(api.getHealth, 15000);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading && !metrics) return <LoadingSpinner label="Loading metrics…" />;

  const breakdown = metrics?.status_breakdown || {};
  const chartData = statusBreakdownToChart(breakdown);

  const cards = [
    { label: 'Total Jobs', value: metrics?.total_jobs ?? 0, icon: Layers3, accent: 'cyan' },
    { label: 'Queue Depth', value: metrics?.queue_depth ?? 0, icon: Server, accent: 'blue' },
    { label: 'Success Rate', value: metrics?.success_rate != null ? `${metrics.success_rate}%` : 'N/A', icon: TrendingUp, accent: 'emerald' },
    { label: 'Avg Execution', value: metrics?.average_execution_time_seconds != null ? `${metrics.average_execution_time_seconds}s` : 'N/A', icon: Gauge, accent: 'cyan' },
    { label: 'Completed', value: breakdown.COMPLETED ?? 0, icon: CheckCircle2, accent: 'emerald' },
    { label: 'Failed', value: breakdown.FAILED ?? 0, icon: AlertTriangle, accent: 'red' },
    { label: 'Throughput', value: 'Not available', icon: Activity, accent: 'blue' },
    { label: 'Latency', value: metrics?.average_execution_time_seconds != null ? `${metrics.average_execution_time_seconds}s avg` : 'Not available', icon: Clock3, accent: 'cyan' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Observability" title="Monitoring" description="Real-time metrics from /api/metrics/dashboard. No historical time-series available." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon, accent }) => (
          <StatCard key={label} title={label} value={value} accent={accent} icon={icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricsChart title="Status Breakdown" type="bar" data={chartData} />
        <MetricsChart title="Status Distribution" type="pie" data={chartData} />
      </div>

      <SystemHealth health={health} jobs={[]} />
    </div>
  );
}

export function LogsPage() {
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = usePolling(async () => api.getJobs({ limit: 100 }), 5000);

  const logs = useMemo(() => deriveLogEntries(data?.jobs || []), [data]);
  const filtered = logs.filter((log) =>
    `${log.service} ${log.worker} ${log.message}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Runtime" title="Logs" description="Event log derived from job lifecycle data." />

      <Panel glow="blue" className="p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs…"
            className="w-full rounded-xl border border-blue-500/15 bg-slate-950/45 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-500/40"
          />
        </div>
      </Panel>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !logs.length && <LoadingSpinner label="Loading logs…" />}

      <div className="overflow-hidden rounded-2xl border border-blue-500/15 bg-slate-950/55">
        <div className="hidden grid-cols-[140px_80px_100px_70px_1fr] gap-3 border-b border-blue-500/15 bg-slate-900/70 px-4 py-3 text-[10px] uppercase tracking-wider text-slate-400 sm:grid">
          <span>Time</span><span>Service</span><span>Worker</span><span>Level</span><span>Message</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No log entries</div>
        ) : (
          filtered.map((log, i) => (
            <div key={i} className={`border-b border-blue-500/10 px-4 py-3 text-sm sm:grid sm:grid-cols-[140px_80px_100px_70px_1fr] sm:gap-3 ${log.highlight ? 'bg-red-500/5' : ''}`}>
              <span className="block text-slate-400">{log.timestamp}</span>
              <span className="text-slate-300">{log.service}</span>
              <span className="text-slate-300">{log.worker}</span>
              <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] ${log.level === 'ERROR' ? 'border-red-500/30 text-red-300' : 'border-cyan-500/30 text-cyan-300'}`}>{log.level}</span>
              <span className="text-slate-400">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function FailedJobsPage() {
  const { data, loading, error, reload } = usePolling(async () => api.getJobs({ status: 'FAILED', limit: 50 }), 5000);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const failedJobs = data?.jobs || [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reliability" title="Failed Jobs" description="Jobs with FAILED status from the backend." />

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !failedJobs.length && <LoadingSpinner label="Loading failed jobs…" />}

      {!loading && failedJobs.length === 0 && (
        <EmptyState title="No failed jobs" description="All tasks completed successfully." />
      )}

      <div className="space-y-3">
        {failedJobs.map((job) => (
          <Panel key={job.id} glow="red" className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-xs text-cyan-300">{formatShortId(job.id)}</p>
                <p className="mt-1 text-lg font-semibold text-white">{job.name}</p>
                <p className="mt-1 text-sm text-slate-400">{job.error || 'No error message'}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedJobId(job.id); setDrawerOpen(true); }}
                className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2 text-sm text-cyan-100"
              >
                View details
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-slate-950/40 p-2"><span className="text-slate-500">Worker</span><p className="text-white">{job.worker_id || '—'}</p></div>
              <div className="rounded-lg bg-slate-950/40 p-2"><span className="text-slate-500">Retries</span><p className="text-white">{job.retries ?? 0}</p></div>
              <div className="rounded-lg bg-slate-950/40 p-2"><span className="text-slate-500">Failed at</span><p className="text-white">{formatTimestamp(job.completed_at)}</p></div>
              <div className="rounded-lg bg-slate-950/40 p-2"><span className="text-slate-500">Queue</span><p className="text-white">{job.queue_name || 'default'}</p></div>
            </div>
          </Panel>
        ))}
      </div>

      <JobDetailsDrawer jobId={selectedJobId} isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedJobId(null); }} />
    </div>
  );
}

export function SchedulerPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Automation" title="Scheduler" description="Scheduled job management." />
      <EmptyState
        title="Not available"
        description="The backend does not expose a scheduler API. Scheduled jobs can be submitted via POST /api/jobs/submit with a scheduled_for field."
      />
    </div>
  );
}

export function SettingsPage() {
  const [refreshInterval, setRefreshInterval] = useState('5s');

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configuration" title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel glow="cyan">
          <h3 className="text-lg font-semibold text-white">Environment</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3 py-2.5">
              <span className="text-slate-400">API endpoint</span>
              <span className="font-mono text-cyan-300">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</span>
            </div>
            <div className="flex justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3 py-2.5">
              <span className="text-slate-400">Theme</span>
              <span className="text-white">Electric Blue</span>
            </div>
            <div className="flex justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3 py-2.5">
              <span className="text-slate-400">Poll interval (display)</span>
              <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className="rounded border border-blue-500/20 bg-slate-900 px-2 py-1 text-slate-200 outline-none">
                <option value="5s">5s</option>
                <option value="10s">10s</option>
                <option value="15s">15s</option>
              </select>
            </div>
          </div>
        </Panel>
        <Panel glow="blue">
          <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <div className="flex justify-between rounded-xl border border-blue-500/10 bg-slate-950/40 px-3 py-2.5">
              <span>Command palette</span>
              <kbd className="rounded border border-slate-600 px-2 py-0.5 font-mono text-xs text-slate-300">Ctrl+K</kbd>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
