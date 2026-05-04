import { motion } from 'framer-motion'

export default function ExportPanel({ results, aiResult }) {
  const handleExportJSON = () => {
    const data = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      aiAnalysis: aiResult || null,
      benchmarkResults: results || null,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neurods-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyMarkdown = () => {
    let md = `# Neuro-DS Results\n\n`
    md += `Generated: ${new Date().toLocaleString()}\n\n`

    if (aiResult) {
      md += `## AI Recommendation\n\n`
      md += `**Winner:** ${aiResult.winner}\n`
      if (aiResult.confidence) md += `**Confidence:** ${Math.round(aiResult.confidence * 100)}%\n`
      if (aiResult.time_complexity) md += `**Time Complexity:** ${aiResult.time_complexity}\n`
      if (aiResult.space_complexity) md += `**Space Complexity:** ${aiResult.space_complexity}\n`
      if (aiResult.justification) md += `\n> ${aiResult.justification}\n`
      md += `\n`
    }

    if (results && results.length > 0) {
      md += `## Benchmark Results\n\n`
      md += `| # | Data Structure | Insert | Search | Delete | Total | Ops/sec |\n`
      md += `|---|---|---|---|---|---|---|\n`
      results.forEach((r, i) => {
        md += `| ${i + 1} | ${r.dsId} | ${r.insertTime}ms | ${r.searchTime}ms | ${r.supportsDelete ? r.deleteTime + 'ms' : 'N/A'} | ${r.totalTime}ms | ${r.opsPerSec?.toLocaleString()} |\n`
      })
    }

    navigator.clipboard.writeText(md).then(() => {
      alert('Copied to clipboard as Markdown!')
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = md
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('Copied to clipboard!')
    })
  }

  const handleCopyTable = () => {
    if (!results || results.length === 0) return
    let text = 'Rank\tDS\tInsert(ms)\tSearch(ms)\tDelete(ms)\tTotal(ms)\tOps/sec\n'
    results.forEach((r, i) => {
      text += `${i + 1}\t${r.dsId}\t${r.insertTime}\t${r.searchTime}\t${r.supportsDelete ? r.deleteTime : 'N/A'}\t${r.totalTime}\t${r.opsPerSec}\n`
    })
    navigator.clipboard.writeText(text)
    alert('Table copied! Paste into Excel/Sheets.')
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📤</span>
        <h3 className="text-sm font-semibold text-white">Export Results</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportJSON}
          className="px-4 py-2 text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg hover:bg-brand-500/20 transition-all flex items-center gap-1.5"
        >
          📄 Download JSON
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCopyMarkdown}
          className="px-4 py-2 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
        >
          📋 Copy Markdown
        </motion.button>
        {results && results.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyTable}
            className="px-4 py-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            📊 Copy for Excel
          </motion.button>
        )}
      </div>
    </div>
  )
}
