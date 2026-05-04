import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRuns, deleteRun, clearAll } from '../utils/historyStore'
import { DS_REGISTRY } from '../engine/dsRegistry'

function getDSName(id) {
  return DS_REGISTRY[id]?.name || id
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() }
  catch { return iso }
}

export default function History() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const loadRuns = async () => {
    try {
      const data = await getRuns(100)
      setRuns(data)
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRuns() }, [])

  const handleDelete = async (id) => {
    await deleteRun(id)
    setRuns(prev => prev.filter(r => r.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleClearAll = async () => {
    if (!window.confirm('Delete all history? This cannot be undone.')) return
    await clearAll()
    setRuns([])
    setExpandedId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Experiment History</h1>
          <p className="text-gray-400 mt-1">
            {runs.length > 0
              ? `${runs.length} run${runs.length !== 1 ? 's' : ''} saved locally in your browser`
              : 'No runs yet — your results will be saved here automatically'
            }
          </p>
        </div>
        {runs.length > 0 && (
          <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
            🗑️ Clear All
          </button>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-4">
          <div className="text-5xl">📜</div>
          <p className="text-gray-400">Run an AI analysis or benchmark to see history here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run, i) => {
            const isExpanded = expandedId === run.id
            const aiWinner = run.aiResult?.winner
            const benchWinner = run.benchmarkResults?.[0]?.dsId
            const displayWinner = aiWinner || (benchWinner ? getDSName(benchWinner) : 'N/A')

            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="glass-card-hover overflow-hidden"
              >
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : run.id)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      run.type === 'ai' ? 'bg-brand-500/15' :
                      run.type === 'benchmark' ? 'bg-emerald-500/15' :
                      'bg-purple-500/15'
                    }`}>
                      {run.type === 'ai' ? '🧠' : run.type === 'benchmark' ? '⚡' : '🔬'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {displayWinner}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(run.timestamp)} •{' '}
                        <span className={`${
                          run.type === 'ai' ? 'text-brand-400' :
                          run.type === 'benchmark' ? 'text-emerald-400' :
                          'text-purple-400'
                        }`}>
                          {run.type === 'ai' ? 'AI Analysis' : run.type === 'benchmark' ? 'Benchmark' : 'AI + Benchmark'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {run.aiResult?.confidence && (
                      <span className="text-sm font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded hidden sm:block">
                        {Math.round(run.aiResult.confidence * 100)}%
                      </span>
                    )}
                    {run.benchmarkResults && (
                      <span className="text-xs text-gray-500 hidden sm:block">
                        {run.benchmarkResults.length} DS tested
                      </span>
                    )}
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gray-400 text-sm"
                    >
                      ▼
                    </motion.span>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                        {/* AI Result */}
                        {run.aiResult && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">AI Analysis</p>
                            <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-lg space-y-1">
                              <p className="text-sm text-white font-medium">Winner: {run.aiResult.winner}</p>
                              {run.aiResult.identified_problem && (
                                <p className="text-xs text-gray-400 italic">"{run.aiResult.identified_problem}"</p>
                              )}
                              <div className="flex gap-2 pt-1 flex-wrap">
                                {run.aiResult.time_complexity && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-mono">⏱ {run.aiResult.time_complexity}</span>
                                )}
                                {run.aiResult.space_complexity && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">💾 {run.aiResult.space_complexity}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Benchmark Results */}
                        {run.benchmarkResults && run.benchmarkResults.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Benchmark Results</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {run.benchmarkResults.slice(0, 8).map((r, j) => (
                                <div key={j} className={`p-2 rounded-lg border text-xs ${j === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/3 border-white/5'}`}>
                                  <p className={`font-semibold ${j === 0 ? 'text-emerald-400' : 'text-gray-300'}`}>
                                    {j === 0 && '🏆 '}{getDSName(r.dsId)}
                                  </p>
                                  <p className="font-mono text-gray-500 mt-0.5">{r.totalTime}ms</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Problem text */}
                        {run.config?.problem_text && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Problem</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{run.config.problem_text}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(run.id) }}
                            className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
