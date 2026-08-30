import { Database, Signal, Server, Zap } from 'lucide-react';

export function SystemHealth({ health = {} }) {
  const healthStatus = {
    api: health?.status === 'healthy' ? 'connected' : 'disconnected',
    database: health?.database === 'connected' ? 'connected' : 'disconnected',
    redis: health?.redis === 'connected' ? 'connected' : 'disconnected',
    workers: 'healthy',
  };

  const statusIcons = {
    api: Signal,
    database: Database,
    redis: Server,
    workers: Zap,
  };

  const statusLabels = {
    api: 'API Server',
    database: 'PostgreSQL',
    redis: 'Redis Queue',
    workers: 'Worker Pool',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 backdrop-blur-xl">
      <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl" />
      
      <h3 className="relative z-10 text-lg font-bold text-white mb-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
        System Health
      </h3>
      
      <div className="relative z-10 space-y-3">
        {Object.entries(healthStatus).map(([key, status]) => {
          const Icon = statusIcons[key];
          const isHealthy = status === 'connected' || status === 'healthy';
          
          return (
            <div
              key={key}
              className="group flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3 backdrop-blur-sm transition hover:border-blue-500/30 hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">{statusLabels[key]}</span>
              </div>
              
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isHealthy
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/40 bg-red-500/10 text-red-200'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`} />
                {isHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
