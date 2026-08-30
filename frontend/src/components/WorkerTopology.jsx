import { Activity, AlertCircle } from 'lucide-react';

export function WorkerTopology() {
  // Mock worker data - in production would come from API
  const workers = [
    { id: 'worker-1', status: 'processing', queue: 'default', currentJob: 'send_email', completed: 248, failed: 3, latency: 1.03 },
    { id: 'worker-2', status: 'idle', queue: 'default', currentJob: null, completed: 156, failed: 1, latency: 0.95 },
    { id: 'worker-3', status: 'processing', queue: 'default', currentJob: 'process_image', completed: 312, failed: 5, latency: 1.15 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'from-cyan-500 to-blue-500';
      case 'idle':
        return 'from-slate-500 to-slate-600';
      case 'offline':
        return 'from-red-500 to-red-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-cyan-500/10 border-cyan-500/30';
      case 'idle':
        return 'bg-slate-500/10 border-slate-500/30';
      case 'offline':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-8 backdrop-blur-xl">
        {/* Animated background gradient */}
        <div className="absolute -right-32 -top-32 h-64 w-64 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 bg-gradient-to-br from-blue-500/15 to-slate-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10">
          {/* Infrastructure Diagram */}
          <div className="mb-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Live Infrastructure Topology</h3>
            <p className="text-sm text-slate-400">Real-time distributed system architecture</p>
          </div>

          {/* ASCII-style topology with visual enhancement */}
          <div className="relative mx-auto max-w-2xl">
            {/* API Server */}
            <div className="text-center mb-8">
              <div className="inline-block rounded-xl border-2 border-cyan-400/50 bg-cyan-500/10 px-6 py-3 backdrop-blur-sm shadow-lg shadow-cyan-500/20">
                <p className="text-sm font-bold text-cyan-300">API SERVER</p>
              </div>
              <div className="h-12 w-1 mx-auto bg-gradient-to-b from-cyan-500/50 to-blue-500/30 mt-2" />
            </div>

            {/* Redis Queue */}
            <div className="text-center mb-8">
              <div className="inline-block rounded-xl border-2 border-purple-400/50 bg-purple-500/10 px-8 py-3 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                <p className="text-sm font-bold text-purple-300">REDIS QUEUE</p>
                <p className="text-xs text-purple-300/70 mt-1">High-Performance Task Queue</p>
              </div>
              <div className="h-12 w-1 mx-auto bg-gradient-to-b from-purple-500/50 to-blue-500/30 mt-2" />
            </div>

            {/* Worker Pool */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-blue-500/50 to-transparent" />
              
              <div className="grid grid-cols-3 gap-6">
                {workers.map((worker, idx) => (
                  <div key={worker.id} className="relative">
                    {/* Connection line from queue */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
                    
                    {/* Worker node */}
                    <div className={`rounded-xl border-2 ${getStatusBgColor(worker.status)} backdrop-blur-sm transition-all duration-300 hover:shadow-lg overflow-hidden group`}>
                      {/* Animated glow effect */}
                      {worker.status === 'processing' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-white">{worker.id}</p>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                            worker.status === 'processing'
                              ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-200'
                              : 'border-slate-500/50 bg-slate-500/20 text-slate-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              worker.status === 'processing'
                                ? 'bg-cyan-400 animate-pulse'
                                : 'bg-slate-400'
                            }`} />
                            {worker.status === 'processing' ? 'PROCESSING' : 'IDLE'}
                          </div>
                        </div>

                        {worker.currentJob && (
                          <div className="mb-3 rounded-lg bg-slate-800/50 px-2 py-1.5 border border-slate-700/50">
                            <p className="text-xs text-slate-400">Current Job</p>
                            <p className="text-xs font-mono text-cyan-300">{worker.currentJob}</p>
                          </div>
                        )}

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Completed:</span>
                            <span className="font-mono text-emerald-300">{worker.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Failed:</span>
                            <span className="font-mono text-red-300">{worker.failed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Latency:</span>
                            <span className="font-mono text-blue-300">{worker.latency}s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-sm font-bold text-cyan-300">{worker.id}</p>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${
                  worker.status === 'processing'
                    ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50'
                    : 'bg-slate-400'
                }`} />
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Queue:</span>
                <span className="text-white font-mono">{worker.queue}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-emerald-300 font-mono">{worker.completed}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="text-red-300 font-mono">{worker.failed}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 rounded-full bg-slate-800 h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${Math.min((worker.completed / 300) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
