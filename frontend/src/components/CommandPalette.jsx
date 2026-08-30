import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandPalette({ onNavigate, onSubmitJob }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'search', label: 'Search Jobs', category: 'Jobs', keywords: 'find jobs', action: () => onNavigate?.('/jobs') },
    { id: 'submit', label: 'Submit Job', category: 'Actions', keywords: 'create new task', action: () => onSubmitJob?.() },
    { id: 'workers', label: 'Open Workers', category: 'Navigation', action: () => onNavigate?.('/workers') },
    { id: 'queues', label: 'Open Queues', category: 'Navigation', action: () => onNavigate?.('/queues') },
    { id: 'monitoring', label: 'Open Monitoring', category: 'Navigation', action: () => onNavigate?.('/monitoring') },
    { id: 'logs', label: 'Open Logs', category: 'Navigation', action: () => onNavigate?.('/logs') },
    { id: 'failed', label: 'Open Failed Jobs', category: 'Navigation', action: () => onNavigate?.('/failed-jobs') },
    { id: 'settings', label: 'Open Settings', category: 'Navigation', action: () => onNavigate?.('/settings') },
    { id: 'dashboard', label: 'Open Dashboard', category: 'Navigation', action: () => onNavigate?.('/') },
    { id: 'refresh', label: 'Refresh Data', category: 'Actions', action: () => window.dispatchEvent(new Event('queue-refresh')) },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()) ||
      (cmd.keywords || '').includes(query.toLowerCase()),
  );

  const run = (action) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-x-0 top-0 z-[70] flex items-start justify-center px-4 pt-[max(1rem,10vh)] sm:pt-20">
        <div className="command-palette-enter w-full max-w-xl overflow-hidden rounded-2xl border border-blue-500/25 bg-slate-950/98 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-blue-500/15 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands…"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <kbd className="hidden rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">Esc</kbd>
          </div>
          <div className="max-h-[min(24rem,50vh)] overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No commands found</div>
            ) : (
              filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => run(cmd.action)}
                  className="flex w-full items-center justify-between border-b border-slate-800/40 px-4 py-3 text-left transition hover:bg-cyan-500/8 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{cmd.label}</p>
                    <p className="text-[10px] text-slate-500">{cmd.category}</p>
                  </div>
                  <kbd className="rounded border border-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-500">↵</kbd>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-blue-500/10 px-4 py-2 text-[10px] text-slate-600">
            <span className="text-slate-500">Ctrl+K</span> to toggle · Navigate without leaving the page
          </div>
        </div>
      </div>
    </>
  );
}
