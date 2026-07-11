import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Custom Tooltip for Line Chart ───────────────────────────────────────────
function CustomLineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: '12px',
      padding: '10px 16px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 700, margin: 0 }}>
        {payload[0].value}
        <span style={{ color: '#818cf8', fontSize: '11px', fontWeight: 500, marginLeft: '5px' }}>mins</span>
      </p>
    </div>
  );
}

// ─── Custom Tooltip for Donut Chart ──────────────────────────────────────────
function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '2px' }}>{payload[0].name}</p>
      <p style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 700, margin: 0 }}>{payload[0].value} tasks</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChartSection() {
  const lineData = [
    { name: 'Mon', mins: 40 },
    { name: 'Tue', mins: 65 },
    { name: 'Wed', mins: 120 },
    { name: 'Thu', mins: 90 },
    { name: 'Fri', mins: 150 },
    { name: 'Sat', mins: 110 },
    { name: 'Sun', mins: 140 },
  ];

  const pieData = [
    { name: 'Completed', value: 5 },
    { name: 'Pending',   value: 3 },
  ];

  const COLORS = ['#4f46e5', '#e2e8f0'];
  const LEGEND_COLORS = ['#4f46e5', '#cbd5e1'];

  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const completedPct = Math.round((pieData[0].value / total) * 100);

  return (
    <section className="flex flex-col gap-4">

      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Analytics</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">Weekly performance overview</p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full tracking-wide">
          This Week
        </span>
      </div>

      {/* ── Charts Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ Line Chart Card ══════════════════════════════════════════ */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.05)' }}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold text-slate-800 leading-tight">Study Time Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Minutes studied per day</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +15% this week
            </div>
          </div>

          {/* Divider accent */}
          <div className="w-full h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-transparent my-4" />

          {/* Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 16, bottom: 5, left: -8 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="lineShadow" x="-5%" y="-20%" width="110%" height="150%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.25" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dx={-4}
                />
                <Tooltip
                  content={<CustomLineTooltip />}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5, strokeDasharray: '5 4' }}
                />
                <Line
                  type="monotone"
                  dataKey="mins"
                  stroke="url(#lineGradient)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2.5, fill: '#fff', stroke: '#6366f1' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#4f46e5', filter: 'url(#lineShadow)' }}
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.3))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ══ Donut Chart Card ══════════════════════════════════════════ */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.05)' }}
        >
          {/* Card Header */}
          <div className="mb-1">
            <h3 className="text-base font-semibold text-slate-800 leading-tight">Task Completion</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Done vs pending tasks</p>
          </div>

          {/* Divider accent */}
          <div className="w-full h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-transparent my-4" />

          {/* Donut + center label */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={74}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={index === 0 ? { filter: 'drop-shadow(0 2px 8px rgba(79,70,229,0.35))' } : {}}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[26px] font-extrabold text-slate-800 leading-none tabular-nums">{completedPct}%</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase mt-1">Completed</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 mb-4" />

          {/* Legend */}
          <div className="flex justify-around">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="block w-2 h-2 rounded-full"
                    style={{ backgroundColor: LEGEND_COLORS[index] }}
                  />
                  <span className="text-xs font-medium text-slate-400">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-700 tabular-nums">{entry.value} <span className="text-slate-400 font-medium">tasks</span></span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
