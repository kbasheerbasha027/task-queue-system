import { Search, Keyboard } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const commands = [
    { id: '1', label: 'Go to Dashboard', category: 'Navigation', action: () => window.location.hash = '/' },
    { id: '2', label: 'Go to Jobs', category: 'Navigation', action: () => window.location.hash = '/jobs' },
    { id: '3', label: 'Go to Workers', category: 'Navigation', action: () => window.location.hash = '/workers' },
    { id: '4', label: 'Go to Monitoring', category: 'Navigation', action: () => window.location.hash = '/monitoring' },
    { id: '5', label: 'Go to Logs', category: 'Navigation', action: () => window.location.hash = '/logs' },
    { id: '6', label: 'Go to Failed Jobs', category: 'Navigation', action: () => window.location.hash = '/failed-jobs' },
    { id: '7', label: 'Go to Queues', category: 'Navigation', action: () => window.location.hash = '/queues' },
    { id: '8', label: 'Go to Scheduler', category: 'Navigation', action: () => window.location.hash = '/scheduler' },
    { id: '9', label: 'Go to Settings', category: 'Navigation', action: () => window.location.hash = '/settings' },
    { id: '10', label: 'Refresh Data', category: 'Actions', action: () => window.dispatchEvent(new Event('queue-refresh')) },
    { id: '11', label: 'Toggle Sidebar', category: 'UI', action: () => {} },
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommand = (action) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-xl rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-blue-500/20 overflow-hidden"
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          {/* Search Input */}
          <div className="border-b border-blue-500/20 px-4 py-3 flex items-center gap-2 bg-slate-900/80">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search TaskFlow..."
              className="flex-1 bg-transparent text-white outline-none placeholder-slate-500 text-sm"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 rounded border border-slate-700 hover:border-slate-600"
            >
              Esc
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                No commands found
              </div>
            ) : (
              filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleCommand(cmd.action)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-500/10 transition border-b border-slate-800/50 last:border-0 flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition">
                      {cmd.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{cmd.category}</p>
                  </div>
                  <Keyboard className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
