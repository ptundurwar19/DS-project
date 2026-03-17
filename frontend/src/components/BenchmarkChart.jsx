import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DS_NAMES = {
  avl: 'AVL',
  redblack: 'Red-Black',
  splay: 'Splay',
  skiplist: 'Skip List',
}

const DS_COLORS = {
  avl: '#6366f1',
  redblack: '#ec4899',
  splay: '#f59e0b',
  skiplist: '#10b981',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="glass-card p-3 text-sm space-y-1">
      <p className="font-semibold text-white">{data.fullName}</p>
      <p className="text-gray-300">Time: <span className="text-brand-400 font-mono">{data.time_us.toLocaleString()} µs</span></p>
      <p className="text-gray-300">Ops: <span className="text-gray-400 font-mono">{data.ops?.toLocaleString()}</span></p>
    </div>
  )
}

export default function BenchmarkChart({ benchmark, winner }) {
  const data = Object.entries(benchmark).map(([key, val]) => ({
    name: DS_NAMES[key] || key,
    fullName: DS_NAMES[key] || key,
    time_us: val.time_us || 0,
    ops: val.ops_completed || 0,
    color: DS_COLORS[key] || '#6366f1',
    isWinner: key === winner,
    key,
  }))

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">⏱️</span>
        <h3 className="text-lg font-semibold text-white">Execution Time Comparison</h3>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Time (µs)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="time_us" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  fillOpacity={entry.isWinner ? 1 : 0.4}
                  stroke={entry.isWinner ? entry.color : 'transparent'}
                  strokeWidth={entry.isWinner ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Winner highlighted • Lower is better
      </p>
    </div>
  )
}
