import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers3,
  ListFilter,
  Logs,
  MemoryStick,
  MessageSquareWarning,
  Play,
  Radar,
  Search,
  ServerCog,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  TrendingUp,
  TriangleAlert,
  Zap,
} from 'lucide-react';

import { ErrorState, JobTable, LoadingSpinner, StatCard } from '../components';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

const queueRows = [
  { name: 'default', depth: 184, rate: '42/min', waiting: 120, active: 16, failed: 8, priority: 'High', throughput: '96%' },
  { name: 'email', depth: 96, rate: '18/min', waiting: 68, active: 9, failed: 3, priority: 'Normal', throughput: '88%' },
  { name: 'analytics', depth: 41, rate: '9/min', waiting: 24, active: 5, failed: 2, priority: 'High', throughput: '91%' },
];

const flowData = [
  { name: '00:00', value: 10 },
  { name: '00:15', value: 22 },
  { name: '00:30', value: 18 },
  { name: '00:45', value: 34 },
  { name: '01:00', value: 41 },
  { name: '01:15', value: 39 },
  { name: '01:30', value: 46 },
  { name: '01:45', value: 54 },
  { name: '02:00', value: 49 },
];

const schedulerRows = [
  { id: 'job-01', schedule: '0 */2 * * *', next: '02:00 UTC', last: '00:00 UTC', status: 'Active', enabled: true },
  { id: 'job-02', schedule: '15 9 * * 1-5', next: '09:15 UTC', last: 'Yesterday', status: 'Queued', enabled: true },
  { id: 'job-03', schedule: '30 18 * * *', next: '18:30 UTC', last: '2 days ago', status: 'Paused', enabled: false },
];

const logRows = [
  { timestamp: '08:14:02', service: 'api', worker: 'worker-01', level: 'INFO', message: 'Job dispatched to queue:default', highlight: false },
  { timestamp: '08:14:13', service: 'worker', worker: 'worker-04', level: 'WARN', message: 'Retry queue pressure detected on send_email', highlight: true },
  { timestamp: '08:14:25', service: 'scheduler', worker: 'scheduler', level: 'INFO', message: 'Cron trigger fired for nightly sync job', highlight: false },
  { timestamp: '08:14:38', service: 'api', worker: 'worker-02', level: 'ERROR', message: 'Database timeout while fetch metrics snapshot', highlight: true },
  { timestamp: '08:15:04', service: 'queue', worker: 'redis', level: 'INFO', message: 'Queue depth normalized after back-pressure resolution', highlight: false },
];

const failedJobs = [
  { id: 'job-8451', errorType: 'TimeoutError', message: 'Worker exceeded SLA while processing email batch', worker: 'worker-04', retries: 3, failedAt: '2026-08-30 08:12', status: 'Retrying' },
  { id: 'job-8712', errorType: 'ConnectionError', message: 'Redis connection interrupted during fetch of cached payload', worker: 'worker-02', retries: 1, failedAt: '2026-08-30 07:58', status: 'Failed' },
  { id: 'job-8826', errorType: 'ValidationError', message: 'Report metadata missing required tenant identifier', worker: 'worker-01', retries: 2, failedAt: '2026-08-30 07:16', status: 'Retrying' },
];

const monitoringCards = [
  { label: 'System throughput', value: '42.8k', delta: '+12.4%', tone: 'cyan', icon: TrendingUp },
  { label: 'Worker utilization', value: '81%', delta: '+8.1%', tone: 'blue', icon: Cpu },
  { label: 'Queue latency', value: '142ms', delta: '-18ms', tone: 'emerald', icon: TimerReset },
  { label: 'Error rate', value: '0.9%', delta: '-0.3%', tone: 'amber', icon: TriangleAlert },
];

function Panel({ children, className = '', glow = 'cyan' }) {
  const glowClasses = {
    cyan: 'from-cyan-500/12 via-sky-500/4 to-transparent',
    blue: 'from-blue-500/12 via-cyan-500/4 to-transparent',
    emerald: 'from-emerald-500/12 via-cyan-500/4 to-transparent',
    amber: 'from-amber-500/12 via-yellow-500/4 to-transparent',
    red: 'from-red-500/12 via-orange-500/4 to-transparent',
  };

  return (
    <div className={`panel relative overflow-hidden rounded-2xl border border-blue-500/15 bg-slate-900/70 p-5 shadow-[0_0_18px_rgba(59,130,246,0.08)] backdrop-blur-xl ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${glowClasses[glow]} opacity-80`} />
      <div className="relative">{children}</div>
    </div>
  );
}

export function DashboardPage({ onOpenSubmit }) {
  const { data: metrics, loading: metricsLoading, error: metricsError, reload: reloadMetrics } = useApi(api.getMetrics, []);
  const { data: jobsData, loading: jobsLoading, error: jobsError, reload: reloadJobs } = useApi(async () => api.getJobs({ limit: 5 }), []);

  const reloadAll = async () => {
    await Promise.all([reloadMetrics(), reloadJobs()]);
  };

  if (metricsLoading && !metrics) {
    return <LoadingSpinner label="Loading dashboard data..." />;
  }

  if (metricsError) {
    return <ErrorState message={metricsError} onRetry={reloadAll} />;
  }

  const totalJobs = metrics?.total_jobs ?? 0;
  const queueDepth = metrics?.queue_depth ?? 0;
  const successRate = metrics?.success_rate ?? 0;
  const executionSeconds = metrics?.average_execution_time_seconds ?? 0;
  const breakdown = metrics?.status_breakdown || {};
  const jobs = jobsData?.jobs || [];

  const cards = [
    { label: 'Total Jobs', value: totalJobs, delta: '+12.4%', icon: Layers3, accent: 'cyan' },
    { label: 'Queued Jobs', value: breakdown.PENDING ?? 0, delta: '+3.1%', icon: Clock3, accent: 'blue' },
    { label: 'Running Jobs', value: breakdown.RUNNING ?? 0, delta: '+2.3%', icon: Activity, accent: 'cyan' },
    { label: 'Completed Jobs', value: breakdown.COMPLETED ?? 0, delta: '+9.8%', icon: CheckCircle2, accent: 'emerald' },
    { label: 'Failed Jobs', value: breakdown.FAILED ?? 0, delta: '-1.1%', icon: AlertTriangle, accent: 'red' },
    { label: 'Success Rate', value: `${successRate}%`, delta: '+4.6%', icon: TrendingUp, accent: 'emerald' },
    { label: 'Queue Depth', value: queueDepth, delta: '+8.7%', icon: Cpu, accent: 'blue' },
    { label: 'Avg Execution', value: `${executionSeconds}s`, delta: '-0.8s', icon: TimerReset, accent: 'cyan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-cyan-300">TaskFlow</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Monitor jobs, queues, workers and system performance in real time across the distributed task infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System operational
          </div>
          <button
            type="button"
            onClick={reloadAll}
            className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, delta, icon: Icon, accent }) => (
          <StatCard key={label} title={label} value={value} subtitle={`${delta} vs last interval`} accent={accent} icon={Icon} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel glow="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.25em] text-slate-400">Architecture</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Distributed worker flow</h3>
            </div>
            <div className="rounded-full border border-cyan-500/25 bg-cyan-500/8 px-3 py-1 text-xs text-cyan-200">4 / 4 online</div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2 text-sm font-medium text-cyan-100">API Server</div>
              <ArrowUpRight className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="flex h-16 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-2 text-sm font-medium text-cyan-100">Redis Queue</div>
              <ArrowUpRight className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="flex h-16 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
            <div className="flex flex-wrap justify-center gap-3">
              {['Worker 01', 'Worker 02', 'Worker 03', 'Worker 04'].map((worker, index) => (
                <div key={worker} className="flex flex-col items-center gap-2">
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border ${index % 2 === 0 ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-cyan-400/40 bg-cyan-500/10'} text-xs font-medium text-white shadow-[0_0_18px_rgba(34,211,238,0.18)]`}>
                    <span className={`absolute inset-2 rounded-full border ${index % 2 === 0 ? 'border-emerald-400/35' : 'border-cyan-400/35'} animate-pulse`} />
                    {worker.split(' ')[1]}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{index === 0 ? 'Healthy' : index === 1 ? 'Processing' : index === 2 ? 'Busy' : 'Healthy'}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel glow="blue" className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">System health</h3>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: 'API', state: 'Connected', tone: 'emerald' },
              { label: 'PostgreSQL', state: 'Healthy', tone: 'cyan' },
              { label: 'Redis', state: 'Connected', tone: 'emerald' },
              { label: 'Workers', state: 'Processing', tone: 'cyan' },
            ].map((service) => (
              <div key={service.label} className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5">
                <span className="text-sm text-slate-300">{service.label}</span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-medium ${service.tone === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${service.tone === 'emerald' ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
                  {service.state}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel glow="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent activity</h3>
            <button type="button" onClick={onOpenSubmit} className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-3 py-2 text-xs font-medium text-cyan-100">Submit job</button>
          </div>

          {jobsError ? (
            <div className="mt-4"><ErrorState message={jobsError} onRetry={reloadJobs} /></div>
          ) : jobsLoading ? (
            <div className="mt-4"><LoadingSpinner label="Loading recent jobs..." /></div>
          ) : jobs.length ? (
            <div className="mt-4"><JobTable jobs={jobs} onRefresh={reloadJobs} /></div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-blue-500/20 bg-slate-950/35 p-6 text-center text-sm text-slate-300">No jobs yet. Submit your first task to begin processing.</div>
          )}
        </Panel>

        <Panel glow="blue" className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Queue health</h3>
            <span className="text-xs text-slate-400">Live</span>
          </div>

          <div className="mt-5 space-y-4">
            {[
              { label: 'Processing rate', value: '42/min', tone: 'cyan' },
              { label: 'Waiting jobs', value: '184', tone: 'blue' },
              { label: 'Retry queue', value: '8', tone: 'amber' },
              { label: 'Failure rate', value: '1.2%', tone: 'red' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className={`font-medium ${item.tone === 'cyan' ? 'text-cyan-200' : item.tone === 'blue' ? 'text-blue-200' : item.tone === 'amber' ? 'text-amber-200' : 'text-red-200'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function JobsPage({ onOpenSubmit }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data, loading, error, reload } = useApi(async () => api.getJobs({ limit: 100 }), []);

  const jobs = useMemo(() => {
    return (data?.jobs || []).filter((job) => {
      const text = `${job.name || ''} ${job.id || ''}`.toLowerCase();
      const matchesText = !query || text.includes(query.toLowerCase());
      const matchesStatus = !status || job.status === status;
      const matchesPriority = !priority || String(job.priority ?? 0) === String(priority);
      return matchesText && matchesStatus && matchesPriority;
    });
  }, [data, query, status, priority]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Operations</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Jobs</h2>
        </div>
        <button type="button" onClick={onOpenSubmit} className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-2.5 text-sm font-medium text-cyan-100">Submit job</button>
      </div>

      <Panel glow="cyan" className="p-4">
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.9fr_0.9fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs or IDs..."
              className="w-full rounded-xl border border-blue-500/15 bg-slate-950/45 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-500/40"
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
            <option value="0">Low</option>
            <option value="1">Normal</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
        </div>
      </Panel>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingSpinner label="Loading jobs..." />
      ) : jobs.length ? (
        <JobTable jobs={jobs} onRefresh={reload} />
      ) : (
        <div className="rounded-2xl border border-dashed border-blue-500/20 bg-slate-900/50 p-10 text-center text-slate-300">No jobs match the current filters.</div>
      )}
    </div>
  );
}

export function WorkersPage() {
  const { data: metrics, loading, error, reload } = useApi(api.getMetrics, []);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading) return <LoadingSpinner label="Loading workers..." />;

  const workers = [
    { id: 'worker-01', status: 'Healthy', queue: 'default', job: 'send_email', latency: '41ms', cpu: '29%', memory: '54%', completed: 184 },
    { id: 'worker-02', status: 'Processing', queue: 'default', job: 'sync_data', latency: '56ms', cpu: '63%', memory: '60%', completed: 143 },
    { id: 'worker-03', status: 'Busy', queue: 'analytics', job: 'generate_report', latency: '72ms', cpu: '78%', memory: '67%', completed: 120 },
    { id: 'worker-04', status: 'Healthy', queue: 'email', job: 'send_email', latency: '48ms', cpu: '33%', memory: '57%', completed: 201 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Execution</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Workers</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          4 / 4 workers online
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workers.map((worker) => (
          <Panel key={worker.id} glow={worker.status === 'Healthy' ? 'cyan' : worker.status === 'Processing' ? 'blue' : 'amber'} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Worker</div>
                <div className="mt-1 text-xl font-semibold text-white">{worker.id}</div>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${worker.status === 'Healthy' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : worker.status === 'Processing' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                {worker.status}
              </span>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2"><span className="text-slate-400">Queue</span><span className="text-white">{worker.queue}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2"><span className="text-slate-400">Current</span><span className="text-white">{worker.job}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2"><span className="text-slate-400">Latency</span><span className="text-cyan-200">{worker.latency}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2"><span className="text-slate-400">CPU</span><span className="text-white">{worker.cpu}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2"><span className="text-slate-400">Memory</span><span className="text-white">{worker.memory}</span></div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel glow="blue" className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Worker summary</h3>
          <span className="text-xs text-slate-400">Updated live</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-4">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-slate-400">Queue depth</div>
            <div className="mt-3 text-3xl font-semibold text-cyan-200">{metrics?.queue_depth ?? 0}</div>
          </div>
          <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-4">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-slate-400">Completed</div>
            <div className="mt-3 text-3xl font-semibold text-emerald-200">{metrics?.status_breakdown?.COMPLETED ?? 0}</div>
          </div>
          <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-4">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-slate-400">Failed</div>
            <div className="mt-3 text-3xl font-semibold text-red-200">{metrics?.status_breakdown?.FAILED ?? 0}</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function QueuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Queue Fleet</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Queue monitoring</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/8 px-3 py-1.5 text-xs text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Queue processing
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {queueRows.map((queue, index) => (
          <Panel key={queue.name} glow={index % 2 === 0 ? 'cyan' : 'blue'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Queue</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{queue.name}</h3>
              </div>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[0.65rem] font-medium text-cyan-200">
                {queue.priority}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3">
                <div className="text-slate-400">Depth</div>
                <div className="mt-2 text-xl font-semibold text-white">{queue.depth}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3">
                <div className="text-slate-400">Rate</div>
                <div className="mt-2 text-xl font-semibold text-white">{queue.rate}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3">
                <div className="text-slate-400">Waiting</div>
                <div className="mt-2 text-xl font-semibold text-white">{queue.waiting}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/40 p-3">
                <div className="text-slate-400">Active</div>
                <div className="mt-2 text-xl font-semibold text-white">{queue.active}</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/40 px-3 py-2.5 text-xs text-slate-300">
              <span>Failed jobs</span>
              <span className="font-medium text-red-200">{queue.failed}</span>
            </div>
          </Panel>
        ))}
      </div>

      <Panel glow="blue" className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Jobs per minute · queue depth</h3>
          <div className="text-xs text-slate-400">Last 2 hours</div>
        </div>
        <div className="mt-5 h-64">
          <div className="flex h-full items-end gap-2">
            {flowData.map((point) => (
              <div key={point.name} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500/80 via-blue-500/60 to-cyan-300/40 shadow-[0_0_20px_rgba(34,211,238,0.18)]" style={{ height: `${point.value * 2.2}px` }} />
                <span className="text-[10px] text-slate-400">{point.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function SchedulerPage() {
  const [selected, setSelected] = useState('job-01');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Automation</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Scheduler</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel glow="cyan">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Scheduled jobs</h3>
            <button type="button" className="rounded-full border border-cyan-500/30 bg-cyan-500/8 px-3 py-1.5 text-xs text-cyan-100">Live timeline</button>
          </div>

          <div className="mt-5 space-y-3">
            {schedulerRows.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelected(job.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${selected === job.id ? 'border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_18px_rgba(34,211,238,0.12)]' : 'border-blue-500/15 bg-slate-950/35 hover:border-blue-400/30'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{job.id}</div>
                    <div className="mt-1 font-medium text-white">{job.schedule}</div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${job.enabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/40 bg-slate-700/30 text-slate-300'}`}>
                    {job.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel glow="blue" className="h-full">
          <div className="flex items-center gap-2 text-cyan-200">
            <CalendarClock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Execution timeline</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Next execution</span>
                <span className="font-medium text-white">02:00 UTC</span>
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Last execution</span>
                <span className="font-medium text-white">00:00 UTC</span>
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Cron</span>
                <span className="font-medium text-cyan-200">0 */2 * * *</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Observability</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Monitoring</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          System operational
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {monitoringCards.map(({ label, value, delta, tone, icon: Icon }) => (
          <Panel key={label} glow={tone === 'cyan' ? 'cyan' : tone === 'blue' ? 'blue' : tone === 'emerald' ? 'emerald' : 'amber'}>
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] uppercase tracking-[0.25em] text-slate-400">{label}</span>
              <div className="rounded-lg border border-blue-500/20 bg-slate-950/40 p-2 text-cyan-200"><Icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-6 text-3xl font-semibold text-white">{value}</div>
            <div className="mt-2 text-xs text-emerald-200">{delta} vs last interval</div>
          </Panel>
        ))}
      </div>

      <Panel glow="blue" className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">System health</h3>
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {['API', 'PostgreSQL', 'Redis', 'Workers', 'Queue', 'Storage'].map((item, index) => (
            <div key={item} className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{item}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
              </div>
              <div className="mt-3 text-sm text-slate-400">Healthy</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function LogsPage() {
  const [query, setQuery] = useState('');
  const filtered = logRows.filter((log) => `${log.service} ${log.worker} ${log.message}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Runtime</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Logs</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/8 px-3 py-1.5 text-xs text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Live stream
        </div>
      </div>

      <Panel glow="blue" className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full rounded-xl border border-blue-500/15 bg-slate-950/45 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ListFilter className="h-4 w-4 text-cyan-300" />
            All levels
          </div>
        </div>
      </Panel>

      <div className="overflow-hidden rounded-2xl border border-blue-500/15 bg-slate-950/55">
        <div className="grid grid-cols-[110px_100px_90px_90px_1fr] gap-3 border-b border-blue-500/15 bg-slate-900/70 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>Time</span>
          <span>Service</span>
          <span>Worker</span>
          <span>Level</span>
          <span>Message</span>
        </div>

        {filtered.map((log) => (
          <div key={`${log.timestamp}-${log.message}`} className={`grid grid-cols-[110px_100px_90px_90px_1fr] gap-3 border-b border-blue-500/10 px-4 py-3 text-sm ${log.highlight ? 'bg-cyan-500/4' : ''}`}>
            <span className="text-slate-300">{log.timestamp}</span>
            <span className="text-slate-200">{log.service}</span>
            <span className="text-slate-200">{log.worker}</span>
            <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${log.level === 'ERROR' ? 'border-red-500/30 bg-red-500/10 text-red-200' : log.level === 'WARN' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
              {log.level}
            </span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FailedJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Reliability</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Failed jobs</h2>
        </div>
        <button type="button" className="rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2 text-sm text-cyan-100">View retry queue</button>
      </div>

      <div className="space-y-4">
        {failedJobs.map((job) => (
          <Panel key={job.id} glow="red" className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.66rem] uppercase tracking-[0.2em] text-slate-400">Job ID</span>
                  <span className="font-mono text-sm text-cyan-200">{job.id}</span>
                </div>
                <div className="mt-2 text-lg font-semibold text-white">{job.errorType}</div>
                <div className="mt-1 max-w-2xl text-sm text-slate-300">{job.message}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-2 text-xs font-medium text-cyan-100">Retry</button>
                <button type="button" className="rounded-xl border border-blue-500/20 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-100">Requeue</button>
                <button type="button" className="rounded-xl border border-slate-600/40 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-100">Details</button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3 text-sm">
                <div className="text-slate-400">Worker</div>
                <div className="mt-1 font-medium text-white">{job.worker}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3 text-sm">
                <div className="text-slate-400">Retries</div>
                <div className="mt-1 font-medium text-white">{job.retries}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3 text-sm">
                <div className="text-slate-400">Failed</div>
                <div className="mt-1 font-medium text-white">{job.failedAt}</div>
              </div>
              <div className="rounded-xl border border-blue-500/15 bg-slate-950/35 p-3 text-sm">
                <div className="text-slate-400">Status</div>
                <div className="mt-1 font-medium text-amber-200">{job.status}</div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [refreshInterval, setRefreshInterval] = useState('15s');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cyan-300">Configuration</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Settings</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel glow="cyan">
          <h3 className="text-lg font-semibold text-white">Environment</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">API endpoint</span><span className="text-cyan-200">http://localhost:5000</span></div>
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">Environment</span><span className="text-white">Development</span></div>
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">Refresh interval</span><select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className="rounded-lg border border-blue-500/20 bg-slate-900 px-2 py-1 text-slate-200 outline-none"><option value="5s">5s</option><option value="15s">15s</option><option value="30s">30s</option><option value="60s">60s</option></select></div>
          </div>
        </Panel>

        <Panel glow="blue">
          <h3 className="text-lg font-semibold text-white">Experience</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">Reduced motion</span><span className="rounded-full border border-cyan-500/30 bg-cyan-500/8 px-2 py-0.5 text-cyan-200">Enabled</span></div>
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">Theme</span><span className="text-white">Electric blue</span></div>
            <div className="flex items-center justify-between rounded-xl border border-blue-500/15 bg-slate-950/35 px-3 py-2.5"><span className="text-slate-400">Notifications</span><span className="text-emerald-200">Active</span></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
