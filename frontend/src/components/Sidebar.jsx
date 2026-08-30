import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  Cpu,
  Layers3,
  LayoutDashboard,
  Logs,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', accent: 'cyan' },
  { label: 'Jobs', icon: BriefcaseBusiness, path: '/jobs', accent: 'blue' },
  { label: 'Queues', icon: Layers3, path: '/queues', accent: 'cyan' },
  { label: 'Workers', icon: Cpu, path: '/workers', accent: 'blue' },
  { label: 'Scheduler', icon: CalendarClock, path: '/scheduler', accent: 'cyan' },
  { label: 'Monitoring', icon: Activity, path: '/monitoring', accent: 'blue' },
  { label: 'Logs', icon: Logs, path: '/logs', accent: 'cyan' },
  { label: 'Failed Jobs', icon: AlertTriangle, path: '/failed-jobs', accent: 'red' },
  { label: 'Settings', icon: Settings, path: '/settings', accent: 'blue' },
];

export function Sidebar({ currentPath, onNavigate, collapsed = false, mobile = false }) {
  const compact = collapsed && !mobile;

  return (
    <aside className={`${mobile ? 'flex h-full w-full flex-col p-5' : 'hidden min-h-screen flex-col border-r border-blue-500/15 bg-slate-950/80 backdrop-blur-xl lg:flex'} ${compact ? 'w-24' : 'w-[18rem]'} transition-all duration-300`}>
      <div className={`mb-8 flex items-center ${compact ? 'justify-center' : 'justify-between'} gap-3 px-1`}>
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-base font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            <Sparkles className="h-5 w-5" />
          </div>
          {!compact && (
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.28em] text-slate-400">TaskFlow</p>
              <h2 className="text-lg font-semibold text-white">Control Center</h2>
            </div>
          )}
        </div>
      </div>

      <nav className={`space-y-2 ${compact ? 'items-center' : ''}`}>
        {navItems.map(({ label, icon: Icon, path, accent }) => {
          const active = currentPath === path;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(path)}
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                active
                  ? 'border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-sky-500/4 text-white shadow-[0_0_18px_rgba(34,211,238,0.12)]'
                  : 'border-transparent bg-slate-900/30 text-slate-300 hover:border-blue-500/20 hover:bg-slate-800/70 hover:text-white'
              } ${compact ? 'justify-center px-2' : ''}`}
            >
              <span className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b ${accent === 'red' ? 'from-red-400 to-orange-400' : 'from-cyan-300 to-blue-500'} ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              <Icon className={`h-4 w-4 ${active ? 'text-cyan-200' : 'text-slate-300'} ${compact ? 'h-5 w-5' : ''}`} />
              {!compact && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {!compact && (
        <div className="mt-auto mb-4 rounded-2xl border border-blue-500/15 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-4 shadow-[0_0_18px_rgba(14,165,233,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Status
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-200">Operational</span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
            System healthy
          </div>
          <div className="mt-2 text-xs text-slate-400">4 / 4 workers online · queue processing</div>
        </div>
      )}
    </aside>
  );
}
