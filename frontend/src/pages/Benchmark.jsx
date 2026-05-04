import { useState } from 'react'
import { motion } from 'framer-motion'
import BenchmarkConfig from '../components/BenchmarkConfig'
import BenchmarkResults from '../components/BenchmarkResults'
import { runBenchmark } from '../engine/benchmarkRunner'

export default function Benchmark({ onResults }) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)

  const handleSubmit = async ({ selectedDS, datasetSize, insertRatio, searchRatio, deleteRatio, customInsert, customSearch, customDelete }) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setProgress({ current: 0, total: selectedDS.length, currentDS: '' })

    try {
      const benchResults = await runBenchmark(
        selectedDS,
        {
          datasetSize,
          insertRatio: insertRatio || 0.34,
          searchRatio: searchRatio || 0.33,
          deleteRatio: deleteRatio || 0.33,
          customInsert: customInsert || null,
          customSearch: customSearch || null,
          customDelete: customDelete || null,
        },
        (dsId, result, current, total) => {
          setProgress({ current, total, currentDS: dsId })
        }
      )
      setResults(benchResults)
      if (onResults) onResults(benchResults)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white">Live Benchmark Lab</h1>
        <p className="text-gray-400 mt-1">
          Select data structures and run real-time benchmarks in your browser
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Progress bar */}
      {progress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              Benchmarking... {progress.current}/{progress.total}
            </span>
            <span className="text-brand-400 font-mono">{progress.currentDS}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {!results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <BenchmarkConfig onSubmit={handleSubmit} loading={loading} />
        </motion.div>
      )}

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <button
              onClick={() => setResults(null)}
              className="btn-secondary text-sm"
            >
              ← Configure New Benchmark
            </button>
          </div>
          <BenchmarkResults results={results} />
        </motion.div>
      )}
    </div>
  )
}
