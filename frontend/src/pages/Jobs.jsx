import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { EmptyState, ErrorState, JobTable, LoadingSpinner, JobDetailsDrawer } from '../components';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

export function Jobs({ onOpenSubmit }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, loading, error, reload } = useApi(async () => api.getJobs({ limit: 100 }), []);

  const jobs = useMemo(() => {
    const list = data?.jobs || [];
    return list.filter((job) => {
      const matchesText = !query || `${job.name || ''} ${job.id || ''}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !status || job.status === status;
      const matchesPriority = !priority || String(job.priority ?? 0) === String(priority);
      return matchesText && matchesStatus && matchesPriority;
    });
  }, [data, query, status, priority]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-semibold">Professional Job Explorer</p>
          <h2 className="mt-2 text-4xl font-bold text-white">All Jobs</h2>
          <p className="mt-3 text-slate-400">Monitor and manage all submitted tasks with detailed insights</p>
        </div>
        <button
          type="button"
          onClick={onOpenSubmit}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-purple-500/40 hover:from-purple-400 hover:to-pink-500"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Submit Job
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-sm">
        <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full blur-2xl" />
        <div className="relative grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by job ID or task name..."
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm"
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">🟡 Pending</option>
            <option value="RUNNING">🔵 Running</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="FAILED">❌ Failed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
          >
            <option value="">All priorities</option>
            <option value="0">Low (0)</option>
            <option value="1">Normal (1)</option>
            <option value="2">High (2)</option>
            <option value="3">Critical (3)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingSpinner label="Loading jobs..." />
      ) : jobs.length ? (
        <>
          <div className="text-sm text-slate-400">
            Showing <span className="font-bold text-white">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} • Click any row for details
          </div>
          <JobTable 
            jobs={jobs} 
            onRefresh={reload}
            onJobClick={(jobId) => {
              setSelectedJobId(jobId);
              setDrawerOpen(true);
            }}
          />
        </>
      ) : (
        <EmptyState title="No jobs match the filters" description="Try adjusting the filters or submit a new task." actionLabel="Submit Job" onAction={onOpenSubmit} />
      )}

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
