import { motion } from 'framer-motion'

export default function ComparisonTable({ alternatives, winner }) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">⚖️</span>
        <h3 className="text-lg font-semibold text-white">Alternatives Comparison</h3>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '30%' }} />
          </colgroup>
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Data Structure</th>
              <th style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Time (Avg/Worst)</th>
              <th style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Space</th>
              <th style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Why Consider It?</th>
              <th style={{ padding: '12px 14px', fontWeight: 500, fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Limitations</th>
            </tr>
          </thead>
          <tbody>
            {/* The Winner first */}
            <tr style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderLeft: '2px solid #6366f1', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#818cf8', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{winner} (Winner)</td>
              <td style={{ padding: '12px 14px', color: '#d1d5db' }}>-</td>
              <td style={{ padding: '12px 14px', color: '#d1d5db' }}>-</td>
              <td style={{ padding: '12px 14px', color: '#d1d5db', overflowWrap: 'break-word', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.5' }}>Chosen based on problem constraints.</td>
              <td style={{ padding: '12px 14px', color: '#d1d5db' }}>-</td>
            </tr>

            {/* Alternatives */}
            {alternatives.map((alt, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                className="hover:bg-white/5 transition-colors"
              >
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#e5e7eb', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{alt.name}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '12px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{alt.time_complexity}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '12px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{alt.space_complexity}</td>
                <td style={{ padding: '12px 14px', color: '#d1d5db', overflowWrap: 'break-word', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.5' }}>{alt.advantages}</td>
                <td style={{ padding: '12px 14px', color: '#9ca3af', overflowWrap: 'break-word', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.5' }}>{alt.limitations}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
