import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DS_NAMES = {
  avl: 'AVL Tree',
  redblack: 'Red-Black Tree',
  splay: 'Splay Tree',
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
      <p className="font-semibold text-white">{data.name}</p>
      <p className="text-gray-300">Time: <span className="text-brand-400 font-mono">{data.x.toLocaleString()} µs</span></p>
      <p className="text-gray-300">Memory: <span className="text-purple-400 font-mono">{(data.y / 1024).toFixed(1)} KB</span></p>
    </div>
  )
}

export default function ParetoChart({ benchmark, winner }) {
  const data = Object.entries(benchmark).map(([key, val]) => ({
    x: val.time_us || 0,
    y: val.memory_bytes || 0,
    name: DS_NAMES[key] || key,
    color: DS_COLORS[key] || '#6366f1',
    isWinner: key === winner,
    key,
  }))

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <h3 className="text-lg font-semibold text-white">Memory vs. Latency Tradeoff</h3>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="x"
              type="number"
              name="Time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Time (µs)', position: 'bottom', fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Memory"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Memory (bytes)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  fillOpacity={entry.isWinner ? 1 : 0.5}
                  r={entry.isWinner ? 12 : 8}
                  stroke={entry.isWinner ? '#fff' : 'transparent'}
                  strokeWidth={entry.isWinner ? 2 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        {data.map((d) => (
          <span key={d.key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: d.color, opacity: d.isWinner ? 1 : 0.5 }}
            />
            <span className={d.isWinner ? 'text-white font-semibold' : 'text-gray-400'}>
              {d.name} {d.isWinner && '★'}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
