import { BarChart3, Gauge, Server, TrendingUp, Workflow } from 'lucide-react';
import { ErrorState, LoadingSpinner, MetricsChart, StatCard } from '../components';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

export function Metrics() {
  const { data, loading, error, reload } = useApi(api.getMetrics, []);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading) return <LoadingSpinner label="Loading metrics..." />;

  const chartData = data && data.status_breakdown
    ? Object.entries(data.status_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const pieData = data && data.status_breakdown
    ? Object.entries(data.status_breakdown).map(([name, value], index) => ({
        name,
        value,
        color: ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 4],
      }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">Analytics</p>
        <h2 className="mt-2 text-4xl font-bold text-white">System Metrics</h2>
        <p className="mt-3 text-slate-400">Real-time insights into your task processing system</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Jobs" value={data?.total_jobs ?? 0} subtitle="All jobs processed" accent="cyan" icon={Workflow} />
        <StatCard title="Success Rate" value={`${data?.success_rate ?? 0}%`} subtitle="Completed vs failed" accent="emerald" icon={TrendingUp} />
        <StatCard title="Avg Duration" value={`${data?.average_execution_time_seconds ?? 0}s`} subtitle="Average execution time" accent="violet" icon={BarChart3} />
        <StatCard title="Queue Depth" value={data?.queue_depth ?? 0} subtitle="Tasks waiting" accent="amber" icon={Server} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricsChart title="Job Status Distribution" type="bar" data={chartData} />
        <MetricsChart title="Status Breakdown" type="pie" data={pieData} />
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Job Status Summary</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-slate-900/50 p-6 backdrop-blur-sm">
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-emerald-500/30 to-teal-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Completed</p>
              <p className="mt-3 text-4xl font-bold text-emerald-300">{data?.status_breakdown?.COMPLETED ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">✅ Successfully processed</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900/50 p-6 backdrop-blur-sm">
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-amber-500/30 to-orange-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pending</p>
              <p className="mt-3 text-4xl font-bold text-amber-300">{data?.status_breakdown?.PENDING ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">⏳ Waiting in queue</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-red-500/20 via-red-500/10 to-slate-900/50 p-6 backdrop-blur-sm">
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-red-500/30 to-pink-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Failed</p>
              <p className="mt-3 text-4xl font-bold text-red-300">{data?.status_breakdown?.FAILED ?? 0}</p>
              <p className="mt-2 text-xs text-slate-400">❌ Encountered issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
