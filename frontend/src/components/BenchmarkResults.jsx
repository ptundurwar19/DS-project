import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { DS_REGISTRY } from '../engine/dsRegistry'

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#0ea5e9', '#d946ef', '#14b8a6', '#f97316', '#06b6d4', '#a855f7',
  '#84cc16', '#e879f9', '#fb923c', '#22d3ee', '#c084fc', '#4ade80',
  '#f43f5e', '#7c3aed', '#34d399', '#fbbf24', '#a78bfa', '#2dd4bf',
  '#fb7185', '#818cf8',
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="glass-card p-3 text-sm space-y-1 min-w-[180px]">
      <p className="font-semibold text-white">{data.name}</p>
      <p className="text-gray-300">Insert: <span className="text-brand-400 font-mono">{data.insertTime}ms</span></p>
      <p className="text-gray-300">Search: <span className="text-emerald-400 font-mono">{data.searchTime}ms</span></p>
      <p className="text-gray-300">Delete: <span className="text-amber-400 font-mono">{data.deleteTime}ms</span></p>
      <p className="text-gray-300">Total: <span className="text-purple-400 font-mono">{data.totalTime}ms</span></p>
      <p className="text-gray-300">Ops/sec: <span className="text-cyan-400 font-mono">{data.opsPerSec?.toLocaleString()}</span></p>
    </div>
  )
}

export default function BenchmarkResults({ results, aiWinner }) {
  if (!results || results.length === 0) return null

  const winner = results[0]

  // Chart data
  const chartData = results.map((r, i) => ({
    name: DS_REGISTRY[r.dsId]?.name || r.dsId,
    insertTime: r.insertTime,
    searchTime: r.searchTime,
    deleteTime: r.deleteTime,
    totalTime: r.totalTime,
    opsPerSec: r.opsPerSec,
    color: COLORS[i % COLORS.length],
    isWinner: i === 0,
    dsId: r.dsId,
  }))

  // Total time bar data
  const totalData = results.map((r, i) => ({
    name: DS_REGISTRY[r.dsId]?.name || r.dsId,
    time: r.totalTime,
    color: COLORS[i % COLORS.length],
    isWinner: i === 0,
  }))

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      <div className="glass-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-purple-500" />
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-brand-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl"
            >
              🏆
            </motion.div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Benchmark Winner</p>
              <h3 className="text-2xl font-bold text-white">{DS_REGISTRY[winner.dsId]?.name || winner.dsId}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {winner.totalTime}ms total • {winner.opsPerSec?.toLocaleString()} ops/sec
              </p>
            </div>
          </div>

          {aiWinner && (
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                (DS_REGISTRY[winner.dsId]?.name || winner.dsId).toLowerCase().includes(aiWinner.toLowerCase().replace(/\s+tree$/, '').replace(/\s+/g, ''))
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {(DS_REGISTRY[winner.dsId]?.name || '').toLowerCase().includes(aiWinner.toLowerCase().split(' ')[0].toLowerCase())
                  ? '✓ AI Prediction Verified'
                  : `⚠ AI suggested: ${aiWinner}`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Time Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h3 className="text-lg font-semibold text-white">Total Execution Time</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="time" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {totalData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={entry.isWinner ? 1 : 0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 text-center">Lower is better • Winner highlighted</p>
        </div>

        {/* Operation Breakdown Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-semibold text-white">Operation Breakdown</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="insertTime" name="Insert" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="searchTime" name="Search" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="deleteTime" name="Delete" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 text-center">Insert • Search • Delete time comparison</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="text-lg font-semibold text-white">Detailed Results</h3>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {['#', 'Data Structure', 'Insert', 'Search', 'Delete', 'Total', 'Ops/sec', 'Hit Rate'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const ds = DS_REGISTRY[r.dsId]
                return (
                  <motion.tr
                    key={r.dsId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: i === 0 ? 'rgba(16,185,129,0.08)' : 'transparent',
                    }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: i === 0 ? '#10b981' : '#6b7280', fontSize: '14px' }}>
                      {i === 0 ? '🏆' : `#${i + 1}`}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: i === 0 ? '#10b981' : '#e5e7eb' }}>
                      {ds?.name || r.dsId}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#818cf8' }}>{r.insertTime}ms</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#34d399' }}>{r.searchTime}ms</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#fbbf24' }}>
                      {r.supportsDelete ? `${r.deleteTime}ms` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#c084fc', fontWeight: 700 }}>{r.totalTime}ms</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#22d3ee' }}>{r.opsPerSec?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '13px', color: '#9ca3af' }}>{r.searchHitRate}%</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
