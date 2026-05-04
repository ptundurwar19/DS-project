import { motion } from 'framer-motion'

export default function ComparisonTable({ alternatives, winner, winnerComplexity }) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">⚖️</span>
        <h3 className="text-lg font-semibold text-white">Alternatives Comparison</h3>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['Data Structure', 'Time Complexity', 'Space', 'Advantages', 'Limitations'].map(h => (
                <th key={h} style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* The Winner first */}
            <tr style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderLeft: '3px solid #6366f1', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#818cf8' }}>
                <span className="flex items-center gap-2">🏆 {winner}</span>
              </td>
              <td style={{ padding: '12px 14px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '12px' }}>
                {winnerComplexity?.time || '—'}
              </td>
              <td style={{ padding: '12px 14px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '12px' }}>
                {winnerComplexity?.space || '—'}
              </td>
              <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>
                Best overall match for your requirements.
              </td>
              <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: '13px' }}>—</td>
            </tr>

            {/* Alternatives */}
            {alternatives.map((alt, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                className="hover:bg-white/5 transition-colors"
              >
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#e5e7eb' }}>{alt.name}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '12px' }}>{alt.time_complexity}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '12px' }}>{alt.space_complexity}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>{alt.advantages}</td>
                <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>{alt.limitations}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
