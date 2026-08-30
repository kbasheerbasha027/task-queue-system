import { Bell, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function Navbar({ title, subtitle, health, onRefresh }) {
  const connected = health?.status === 'healthy' || health?.database === 'connected' || health?.redis === 'connected';

  return (
    <header className="sticky top-0 z-30 border-b border-blue-500/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Distributed Task Infrastructure</p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-blue-500/15 bg-slate-900/60 px-3.5 py-2 text-xs text-slate-200 md:flex">
            {connected ? (
              <>
                <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400/40 blur-[6px]" />
                  <Wifi className="relative h-3.5 w-3.5 text-emerald-300" />
                </div>
                <span>System operational</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
                <span>API offline</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="group inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-800/80"
          >
            <RefreshCw className="h-4 w-4 text-cyan-300 transition-transform duration-500 group-hover:rotate-180" />
            Refresh
          </button>

          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/15 bg-slate-900/60 text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800/80"
            aria-label="Notifications"
          >
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <Bell className="h-4 w-4 text-cyan-200" />
          </button>
        </div>
      </div>
    </header>
  );
}
