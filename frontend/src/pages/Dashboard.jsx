import { Activity, BarChart3, Clock3, Gauge, Server, ShieldCheck, Workflow } from 'lucide-react';
import { EmptyState, ErrorState, JobTable, LoadingSpinner, MetricsChart, StatCard, SystemHealth, WorkerTopology, QueueVisualization, ActivityFeed, JobDetailsDrawer } from '../components';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useState } from 'react';

const statusColors = {
  COMPLETED: '#10b981',
  PENDING: '#f59e0b',
  FAILED: '#ef4444',
  RUNNING: '#06b6d4',
};

export function Dashboard({ onOpenSubmit }) {
  const { data: metrics, loading: metricsLoading, error: metricsError, reload: reloadMetrics } = useApi(api.getMetrics, []);
  const { data: jobsData, loading: jobsLoading, error: jobsError, reload: reloadJobs } = useApi(async () => api.getJobs({ limit: 8 }), []);
  const { data: health, loading: healthLoading, error: healthError, reload: reloadHealth } = useApi(api.getHealth, []);
  
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const chartData = metrics && metrics.status_breakdown
    ? Object.entries(metrics.status_breakdown).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || '#94a3b8',
      }))
    : [];

  const queueDepthValue = metrics?.queue_depth ?? 0;
  const successRateValue = metrics?.success_rate ?? 0;
  const totalJobsValue = metrics?.total_jobs ?? 0;
  const avgSecondsValue = metrics?.average_execution_time_seconds ?? 0;

  const jobs = jobsData?.jobs || [];

  const reloadAll = async () => {
    await Promise.all([reloadMetrics(), reloadJobs(), reloadHealth()]);
  };

  if (metricsLoading && !metrics) {
    return <LoadingSpinner label="Loading dashboard data..." />;
  }

  if (metricsError) {
    return <ErrorState message={metricsError} onRetry={reloadAll} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-semibold">Distributed Task Infrastructure</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Real-Time Command Center</h2>
          <p className="mt-3 max-w-md text-slate-400">Monitor distributed workers, queues, and task lifecycle with live infrastructure visibility.</p>
        </div>
        <button
          type="button"
          onClick={reloadAll}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-500"
        >
          <Activity className="h-4 w-4 group-hover:animate-pulse" />
          Refresh All
        </button>
      </div>

      {/* System Health & Key Metrics */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SystemHealth health={health} />
        
        {/* Main Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-2">
          <StatCard title="Total Jobs" value={totalJobsValue} subtitle="All tasks processed" accent="cyan" icon={Workflow} />
          <StatCard title="Completed" value={metrics?.status_breakdown?.COMPLETED ?? 0} subtitle="Successful jobs" accent="emerald" icon={ShieldCheck} />
          <StatCard title="Pending" value={metrics?.status_breakdown?.PENDING ?? 0} subtitle="Queued tasks" accent="amber" icon={Clock3} />
          <StatCard title="Failed" value={metrics?.status_breakdown?.FAILED ?? 0} subtitle="Issues encountered" accent="red" icon={Gauge} />
        </div>
      </div>

      {/* Worker Topology - Hero Component */}
      <WorkerTopology />

      {/* Queue Visualization - Hero Component */}
      <QueueVisualization queueDepth={queueDepthValue} throughput={Math.max(1, Math.floor(totalJobsValue / 60))} />

      {/* Secondary Metrics */}
      <div className="grid gap-5 lg:grid-cols-3">
        <StatCard title="Queue Depth" value={queueDepthValue} subtitle="Messages in Redis queue" accent="violet" icon={Server} />
        <StatCard title="Success Rate" value={`${successRateValue}%`} subtitle="Completed vs failed ratio" accent="emerald" icon={ShieldCheck} />
        <StatCard title="Avg Duration" value={`${avgSecondsValue}s`} subtitle="Average job execution time" accent="cyan" icon={BarChart3} />
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <MetricsChart title="Job Status Distribution" type="bar" data={chartData} />
        <ActivityFeed />
      </div>

      {/* Recent Jobs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
            <p className="mt-1 text-sm text-slate-400">Latest jobs from your distributed system</p>
          </div>
          <button
            type="button"
            onClick={onOpenSubmit}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-2.5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-purple-500/40 hover:from-purple-400 hover:to-pink-500"
          >
            <Activity className="h-4 w-4" />
            Submit Job
          </button>
        </div>

        {jobsError ? (
          <ErrorState message={jobsError} onRetry={reloadJobs} />
        ) : jobsLoading ? (
          <LoadingSpinner label="Loading recent jobs..." />
        ) : jobs.length ? (
          <JobTable 
            jobs={jobs} 
            onRefresh={reloadJobs}
            onJobClick={(jobId) => {
              setSelectedJobId(jobId);
              setDrawerOpen(true);
            }}
          />
        ) : (
          <EmptyState title="No jobs yet" description="Submit your first task to start processing jobs." actionLabel="Submit Job" onAction={onOpenSubmit} />
        )}
      </div>

      {/* Job Details Drawer */}
      <JobDetailsDrawer
        jobId={selectedJobId}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedJobId(null);
        }}
      />
    </div>
  );
}
