import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function MetricsChart({ type = 'bar', data = [], title }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-sm text-slate-400 backdrop-blur-sm">
        No chart data available
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm">
        <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-full blur-2xl" />
        <h3 className="relative mb-6 text-lg font-bold text-white">{title}</h3>
        <div className="relative h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color || ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1438',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm">
      <div className="absolute -right-20 -top-20 h-40 w-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full blur-2xl" />
      <h3 className="relative mb-6 text-lg font-bold text-white">{title}</h3>
      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              contentStyle={{
                backgroundColor: '#0f1438',
                border: '1px solid #475569',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
