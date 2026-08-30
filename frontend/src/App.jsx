import { useEffect, useMemo, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Navbar, Sidebar, SubmitJobModal, CommandPalette, NotificationCenter } from './components';
import {
  DashboardPage,
  JobsPage,
  QueuesPage,
  WorkersPage,
  SchedulerPage,
  MonitoringPage,
  LogsPage,
  FailedJobsPage,
  SettingsPage,
} from './pages/TaskFlowPages';
import { api } from './services/api';

const pageMeta = {
  '/': { title: 'TaskFlow', subtitle: 'Distributed Task Infrastructure', label: 'Dashboard' },
  '/jobs': { title: 'Jobs', subtitle: 'Execution history and task lifecycle', label: 'Jobs' },
  '/queues': { title: 'Queues', subtitle: 'Flow control and backlog health', label: 'Queues' },
  '/workers': { title: 'Workers', subtitle: 'Execution nodes and capacity', label: 'Workers' },
  '/scheduler': { title: 'Scheduler', subtitle: 'Cron automation and orchestration', label: 'Scheduler' },
  '/monitoring': { title: 'Monitoring', subtitle: 'SLOs, throughput, and service health', label: 'Monitoring' },
  '/logs': { title: 'Logs', subtitle: 'Operational events and runtime diagnostics', label: 'Logs' },
  '/failed-jobs': { title: 'Failed Jobs', subtitle: 'Retries, faults, and resolution flow', label: 'Failed Jobs' },
  '/settings': { title: 'Settings', subtitle: 'Platform configuration and preferences', label: 'Settings' },
};

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchHealth = async () => {
    try {
      const result = await api.getHealth();
      setHealth(result);
    } catch {
      setHealth({ status: 'error' });
    }
  };

  useEffect(() => {
    fetchHealth();
    const id = window.setInterval(fetchHealth, 15000);
    return () => window.clearInterval(id);
  }, []);

  const currentPage = useMemo(() => {
    switch (currentPath) {
      case '/jobs':
        return <JobsPage onOpenSubmit={() => setIsModalOpen(true)} />;
      case '/queues':
        return <QueuesPage />;
      case '/workers':
        return <WorkersPage />;
      case '/scheduler':
        return <SchedulerPage />;
      case '/monitoring':
        return <MonitoringPage />;
      case '/logs':
        return <LogsPage />;
      case '/failed-jobs':
        return <FailedJobsPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onOpenSubmit={() => setIsModalOpen(true)} />;
    }
  }, [currentPath]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setMessage('');

    try {
      await api.submitJob(payload);
      setMessage('Job submitted successfully.');
      setIsModalOpen(false);
      setCurrentPath('/jobs');
      window.dispatchEvent(new Event('queue-refresh'));
    } catch (error) {
      setMessage(error.message || 'Failed to submit job.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeMeta = pageMeta[currentPath] || pageMeta['/'];

  return (
    <div className="taskflow-shell min-h-screen bg-transparent text-slate-100">
      <CommandPalette
        onNavigate={(path) => {
          setCurrentPath(path);
          setSidebarOpen(false);
        }}
        onSubmitJob={() => setIsModalOpen(true)}
      />
      <NotificationCenter />
      <div className="flex min-h-screen">
        <Sidebar
          currentPath={currentPath}
          onNavigate={(path) => {
            setCurrentPath(path);
            setSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="fixed inset-y-0 left-0 z-50 w-[18rem] border-r border-blue-500/15 bg-slate-950/80 backdrop-blur-xl lg:hidden" style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' }}>
          <div className="flex items-center justify-between border-b border-blue-500/15 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-base font-bold text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.5)]">T</div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-slate-400">TaskFlow</p>
                <h2 className="text-sm font-semibold text-white">Control Center</h2>
              </div>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-xl border border-blue-500/15 bg-slate-900/60 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Sidebar
            currentPath={currentPath}
            onNavigate={(path) => {
              setCurrentPath(path);
              setSidebarOpen(false);
            }}
            collapsed={false}
            mobile
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-blue-500/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-blue-500/15 bg-slate-900/60 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white">
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-sm font-medium text-white">{activeMeta.label}</div>
            </div>
            <button type="button" onClick={() => setSidebarCollapsed((prev) => !prev)} className="rounded-xl border border-blue-500/15 bg-slate-900/60 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white lg:hidden">
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <Navbar
            title={activeMeta.title}
            subtitle={activeMeta.subtitle}
            health={health}
            onRefresh={fetchHealth}
          />

          <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            {message && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-200 backdrop-blur-sm">
                {message}
              </div>
            )}
            {currentPage}
          </main>
        </div>
      </div>

      <SubmitJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}

export default App;
