export function StatCard({ title, value, subtitle, accent = 'cyan', icon: Icon }) {
  const accentConfigs = {
    cyan: {
      gradient: 'from-cyan-500/40 via-cyan-500/20 to-blue-500/20',
      icon: 'from-cyan-400 to-blue-500',
      glow: 'shadow-glow-cyan',
      text: 'text-cyan-300',
    },
    blue: {
      gradient: 'from-blue-500/40 via-blue-500/20 to-cyan-500/20',
      icon: 'from-blue-400 to-cyan-500',
      glow: 'shadow-glow-cyan',
      text: 'text-blue-300',
    },
    emerald: {
      gradient: 'from-emerald-500/40 via-emerald-500/20 to-teal-500/20',
      icon: 'from-emerald-400 to-teal-500',
      glow: 'shadow-glow-green',
      text: 'text-emerald-300',
    },
    amber: {
      gradient: 'from-amber-500/40 via-amber-500/20 to-orange-500/20',
      icon: 'from-amber-400 to-orange-500',
      glow: 'shadow-glow-pink',
      text: 'text-amber-300',
    },
    red: {
      gradient: 'from-red-500/40 via-red-500/20 to-pink-500/20',
      icon: 'from-red-400 to-pink-500',
      glow: 'shadow-glow-pink',
      text: 'text-red-300',
    },
    violet: {
      gradient: 'from-violet-500/40 via-violet-500/20 to-purple-500/20',
      icon: 'from-violet-400 to-purple-500',
      glow: 'shadow-glow-purple',
      text: 'text-violet-300',
    },
  };

  const config = accentConfigs[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all duration-300 hover:border-slate-600/50 hover:from-slate-800/70 hover:to-slate-900/70 backdrop-blur-sm">
      {/* Gradient accent background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Glow effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br opacity-0 group-hover:opacity-30 rounded-full blur-3xl transition-opacity duration-300" style={{
        backgroundImage: `linear-gradient(to bottom right, #${accent === 'cyan' ? '06b6d4' : accent === 'emerald' ? '10b981' : accent === 'amber' ? 'fbbf24' : accent === 'red' ? 'ef4444' : '8b5cf6'}, transparent)`,
      }} />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-400 uppercase tracking-wide">{title}</p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-white">{value}</p>
          </div>
          <div className={`relative flex-shrink-0 rounded-xl border border-slate-700/40 bg-gradient-to-br ${config.icon} p-3 ${config.glow}`}>
            {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
          </div>
        </div>
        {subtitle && <p className="mt-4 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
