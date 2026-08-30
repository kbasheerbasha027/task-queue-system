import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'Queue Pressure Detected',
      message: 'Default queue depth exceeded 100 messages',
      timestamp: new Date(Date.now() - 60000),
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Job Completed',
      message: 'Job #8827 completed successfully',
      timestamp: new Date(Date.now() - 120000),
      read: false,
    },
    {
      id: '3',
      type: 'error',
      title: 'Worker Offline',
      message: 'Worker-4 went offline',
      timestamp: new Date(Date.now() - 300000),
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'System Update',
      message: 'Scheduled maintenance completed',
      timestamp: new Date(Date.now() - 600000),
      read: true,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400' };
      case 'success':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' };
      case 'warning':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' };
      case 'info':
      default:
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-400' };
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    return new Date(date).toLocaleTimeString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center h-12 w-12 rounded-full border border-cyan-500/30 bg-gradient-to-br from-slate-800 to-slate-900 text-cyan-400 hover:border-cyan-400/50 hover:text-cyan-300 transition shadow-lg shadow-cyan-500/20"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute bottom-16 right-0 w-96 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-blue-500/20 overflow-hidden"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="border-b border-blue-500/20 px-4 py-3 bg-slate-900/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-cyan-400" />
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = getTypeIcon(notif.type);
                  const colors = getTypeColor(notif.type);

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`border-b border-slate-800/50 px-4 py-3 transition cursor-pointer hover:bg-slate-800/30 ${
                        !notif.read ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colors.bg} border ${colors.border}`}>
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{notif.title}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notif.id);
                              }}
                              className="text-slate-400 hover:text-white transition flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatTime(notif.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-800/50 px-4 py-2 bg-slate-900/50 text-center">
                <button className="text-xs text-slate-400 hover:text-slate-300 transition">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.6);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
