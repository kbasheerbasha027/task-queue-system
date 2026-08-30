import { useState } from 'react';
import { X } from 'lucide-react';

export function SubmitJobModal({ isOpen, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: 'send_email',
    email: 'user@example.com',
    subject: 'Welcome',
    priority: 1,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'priority' ? Number(value) : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name,
      payload: {
        email: form.email,
        subject: form.subject,
      },
      priority: form.priority,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/40 bg-gradient-to-br from-dark-850 via-dark-800 to-dark-900 shadow-2xl shadow-purple-500/20">
        {/* Gradient backgrounds */}
        <div className="absolute -right-40 -top-40 h-80 w-80 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-40 -bottom-40 h-80 w-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-6 py-5">
            <div>
              <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">New Job</p>
              <h3 className="mt-1 text-xl font-bold text-white">Submit Task</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-2 text-slate-300 transition hover:bg-slate-700/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Task Name</label>
              <select
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white outline-none transition placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm"
              >
                <option value="send_email">📧 send_email</option>
                <option value="generate_report">📊 generate_report</option>
                <option value="process_video">🎥 process_video</option>
                <option value="sync_data">🔄 sync_data</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white outline-none transition placeholder-slate-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                >
                  <option value={0}>Low (0)</option>
                  <option value={1}>Normal (1)</option>
                  <option value={2}>High (2)</option>
                  <option value={3}>Critical (3)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Subject Line</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white outline-none transition placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-2.5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-purple-500/40 hover:from-purple-400 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {loading ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
