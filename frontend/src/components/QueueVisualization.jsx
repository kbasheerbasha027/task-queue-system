import { Zap } from 'lucide-react';

export function QueueVisualization({ queueDepth = 0, throughput = 0 }) {
  // Determine queue pressure level
  const getPressureLevel = (depth) => {
    if (depth === 0) return { level: 'IDLE', color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-500/10', textColor: 'text-slate-300' };
    if (depth < 5) return { level: 'LOW', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-300' };
    if (depth < 15) return { level: 'MEDIUM', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10', textColor: 'text-amber-300' };
    return { level: 'HIGH', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-500/10', textColor: 'text-red-300' };
  };

  const pressureData = getPressureLevel(queueDepth);
  const fillPercentage = Math.min((queueDepth / 30) * 100, 100);

  // Mock queue items for visualization
  const queueItems = Array.from({ length: Math.min(Math.max(queueDepth, 0), 12) }, (_, i) => ({
    id: i + 1,
    job: `job-${String(i + 1).padStart(4, '0')}`,
    task: ['send_email', 'process_image', 'generate_report', 'backup_data'][i % 4],
    priority: Math.floor(Math.random() * 5),
  }));

  return (
    <div className="space-y-6">
      {/* Main Queue Visualization */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-8 backdrop-blur-xl">
        {/* Animated background gradient */}
        <div className="absolute -right-32 -top-32 h-64 w-64 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            Real-Time Queue Pipeline
          </h3>

          {/* Queue Pressure Status */}
          <div className="mb-8 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider">Queue Status</p>
                <p className={`text-3xl font-bold mt-2 ${pressureData.textColor}`}>{pressureData.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Depth</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono mt-2">{queueDepth}</p>
              </div>
            </div>

            {/* Pressure bar */}
            <div className="relative h-4 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${pressureData.color} shadow-lg transition-all duration-300`}
                style={{ width: `${fillPercentage}%` }}
              />
              {/* Animated glow */}
              <div
                className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r ${pressureData.color} blur-md opacity-50 animate-pulse`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Queue Flow Visualization */}
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-4 uppercase tracking-wider">Job Flow</p>
            
            {/* Incoming Jobs → Queue → Workers */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Incoming */}
              <div className="text-center">
                <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4 mb-2">
                  <p className="text-xs uppercase text-purple-300 font-bold tracking-wider">Incoming</p>
                  <p className="text-2xl font-bold text-purple-200 mt-1">{throughput}</p>
                  <p className="text-xs text-purple-300/70 mt-1">/sec</p>
                </div>
                <div className="text-xs text-slate-400">Job Submission Rate</div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="text-2xl text-blue-400 animate-pulse">→</div>
              </div>

              {/* Queue */}
              <div className="text-center">
                <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-4 mb-2">
                  <p className="text-xs uppercase text-cyan-300 font-bold tracking-wider">Queue Depth</p>
                  <p className="text-2xl font-bold text-cyan-200 mt-1">{queueDepth}</p>
                  <p className="text-xs text-cyan-300/70 mt-1">Waiting</p>
                </div>
                <div className="text-xs text-slate-400">Current Backlog</div>
              </div>
            </div>

            {/* Queue Items Grid */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Queued Jobs</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {queueItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-blue-500/30 p-3 text-center transition hover:from-cyan-500/25 hover:to-blue-500/20 hover:border-cyan-500/50 cursor-pointer"
                    style={{
                      animation: `float ${2 + (item.priority * 0.2)}s ease-in-out infinite`,
                      animationDelay: `${item.id * 0.1}s`,
                    }}
                  >
                    <p className="text-xs font-mono text-cyan-300 truncate">{item.job}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{item.task}</p>
                    
                    {/* Tooltip */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs whitespace-nowrap text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                      {item.task}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Queue Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Processing</p>
              <p className="text-xl font-bold text-emerald-300 mt-2">1.2s</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Throughput</p>
              <p className="text-xl font-bold text-cyan-300 mt-2">{throughput} jobs/s</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Est. Time</p>
              <p className="text-xl font-bold text-blue-300 mt-2">{Math.ceil(queueDepth / (throughput || 1))}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation keyframes via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
