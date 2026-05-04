import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const DS_NAMES = {
  avl: 'AVL Tree',
  redblack: 'Red-Black Tree',
  splay: 'Splay Tree',
  skiplist: 'Skip List',
}

export default function History() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history?limit=50')
      .then(res => res.json())
      .then(data => {
        setRuns(data.runs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Experiment History</h1>
        <p className="text-gray-400 mt-1">Past simulation runs stored locally</p>
      </div>

      {runs.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-4">
          <div className="text-5xl">📜</div>
          <p className="text-gray-400">No runs yet. Go run a search!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run, i) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="glass-card-hover p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${run.ai_correct ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div>
                  <p className="font-medium text-white">
                    {DS_NAMES[run.prediction?.winner] || run.prediction?.winner}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(run.timestamp).toLocaleString()} • {run.config?.dataset_size?.toLocaleString()} ops
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-mono text-brand-400">
                    {(run.prediction?.confidence * 100)?.toFixed(0)}% confidence
                  </p>
                </div>
                <span className={run.ai_correct ? 'badge-correct' : 'badge-incorrect'}>
                  {run.ai_correct ? '✓ Correct' : '✗ Wrong'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
