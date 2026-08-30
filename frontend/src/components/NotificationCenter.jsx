import { AlertCircle, Bell, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { deriveNotifications, formatRelativeTime } from '../utils/dataHelpers';

const TYPE_CONFIG = {
  error: { Icon: AlertCircle, colors: 'border-red-500/30 bg-red-500/10 text-red-300' },
  success: { Icon: CheckCircle, colors: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  warning: { Icon: AlertTriangle, colors: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  info: { Icon: Info, colors: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const load = async () => {
    try {
      const [jobsData, metrics] = await Promise.all([
        api.getJobs({ limit: 30 }),
        api.getMetrics(),
      ]);
      const derived = deriveNotifications(jobsData.jobs || [], metrics);
      setNotifications(derived.filter((n) => !dismissed.has(n.id)));
    } catch {
      // silent — notifications are non-critical
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 8000);
    const onRefresh = () => load();
    const onToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('queue-refresh', onRefresh);
    window.addEventListener('taskflow:toggle-notifications', onToggle);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('queue-refresh', onRefresh);
      window.removeEventListener('taskflow:toggle-notifications', onToggle);
    };
  }, [dismissed]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    notifications.forEach((n) => dismiss(n.id));
  };

  return (
    <>
      {/* Mobile / fallback trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/90 text-cyan-400 shadow-lg shadow-cyan-500/10 transition hover:border-cyan-400/50 lg:hidden"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="notification-panel fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-blue-500/20 bg-slate-950/95 shadow-2xl shadow-blue-500/10 backdrop-blur-xl sm:right-6">
            <div className="flex items-center justify-between border-b border-blue-500/15 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bell className="h-4 w-4 text-cyan-400" />
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">{unreadCount} new</span>
                )}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="custom-scrollbar max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">No notifications</div>
              ) : (
                notifications.map((notif) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                  const { Icon } = config;
                  return (
                    <div
                      key={notif.id}
                      className={`border-b border-slate-800/50 px-4 py-3 transition hover:bg-slate-800/30 ${!notif.read ? 'bg-slate-800/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${config.colors}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            <button type="button" onClick={() => dismiss(notif.id)} className="text-slate-500 hover:text-white">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">{notif.message}</p>
                          <p className="mt-1 text-[10px] text-slate-600">{formatRelativeTime(notif.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-slate-800/50 px-4 py-2 text-center">
                <button type="button" onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-300">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
