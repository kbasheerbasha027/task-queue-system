export function Panel({ children, className = '', glow = 'cyan' }) {
  const glowClasses = {
    cyan: 'from-cyan-500/12 via-sky-500/4 to-transparent',
    blue: 'from-blue-500/12 via-cyan-500/4 to-transparent',
    emerald: 'from-emerald-500/12 via-cyan-500/4 to-transparent',
    amber: 'from-amber-500/12 via-yellow-500/4 to-transparent',
    red: 'from-red-500/12 via-orange-500/4 to-transparent',
  };

  return (
    <div className={`panel relative overflow-hidden rounded-2xl border border-blue-500/15 bg-slate-900/70 p-5 shadow-[0_0_18px_rgba(59,130,246,0.08)] backdrop-blur-xl ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${glowClasses[glow] || glowClasses.cyan} opacity-80`} />
      <div className="relative">{children}</div>
    </div>
  );
}
