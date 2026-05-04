import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProblemInput from '../components/ProblemInput'
import BenchmarkConfig from '../components/BenchmarkConfig'
import { runBenchmark } from '../engine/benchmarkRunner'
import { saveRun } from '../utils/historyStore'

export default function Home({ onResults, onBenchmarkResults }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('ai') // 'ai' | 'benchmark'
  const [loadingPhase, setLoadingPhase] = useState('') // 'ai' | 'benchmark'

  const handleAISubmit = async (config) => {
    setLoading(true)
    setError(null)
    setLoadingPhase('ai')
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${res.status}`)
      }
      const data = await res.json()
      onResults(data)

      // Auto-run benchmark if AI suggests structures
      const prediction = data.prediction || data
      let benchResults = null
      if (prediction.benchmark_suggestion && prediction.benchmark_suggestion.length > 0) {
        setLoadingPhase('benchmark')
        benchResults = await runBenchmark(prediction.benchmark_suggestion, { datasetSize: 5000 })
        onBenchmarkResults(benchResults)
      }

      // Save to local history
      try {
        await saveRun({
          type: benchResults ? 'combined' : 'ai',
          config: { problem_text: config.problem_text },
          aiResult: prediction,
          benchmarkResults: benchResults,
        })
      } catch (_) { /* non-critical */ }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingPhase('')
    }
  }

  const handleBenchmarkSubmit = async ({ selectedDS, datasetSize, insertRatio, searchRatio, deleteRatio, customInsert, customSearch, customDelete }) => {
    setLoading(true)
    setError(null)
    setLoadingPhase('benchmark')
    try {
      const benchConfig = {
        datasetSize,
        insertRatio: insertRatio || 0.34,
        searchRatio: searchRatio || 0.33,
        deleteRatio: deleteRatio || 0.33,
        customInsert: customInsert || null,
        customSearch: customSearch || null,
        customDelete: customDelete || null,
      }
      const results = await runBenchmark(selectedDS, benchConfig)
      onBenchmarkResults(results)
      onResults(null)

      // Save to local history
      try {
        await saveRun({
          type: 'benchmark',
          config: { selectedDS, datasetSize, insertRatio, searchRatio, deleteRatio },
          aiResult: null,
          benchmarkResults: results,
        })
      } catch (_) { /* non-critical */ }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingPhase('')
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 py-8"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="gradient-text">Neuro-DS</span>
          <br />
          <span className="text-white">Data Structure Intelligence</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          AI-powered recommendations backed by real-time in-browser benchmarks.
          Analyze 22 advanced data structures instantly.
        </p>
        <div className="flex justify-center gap-3 pt-2 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">22 Data Structures</span>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">AI-Powered Analysis</span>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live Benchmarks</span>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/50 p-1 rounded-full border border-white/5 inline-flex relative">
          <motion.div
            className="absolute top-1 bottom-1 bg-gradient-to-r from-brand-600 to-purple-600 rounded-full"
            initial={false}
            animate={{
              left: mode === 'ai' ? '4px' : '50%',
              width: 'calc(50% - 4px)',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
          <button
            onClick={() => setMode('ai')}
            className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors w-48 rounded-full ${mode === 'ai' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            🧠 AI Advisor
          </button>
          <button
            onClick={() => setMode('benchmark')}
            className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors w-48 rounded-full ${mode === 'benchmark' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ Live Benchmark
          </button>
        </div>
      </div>

      {/* Loading indicator with phases */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              {loadingPhase === 'ai' && (
                <div>
                  <p className="text-white font-medium">🧠 Analyzing with AI...</p>
                  <p className="text-xs text-gray-400">Understanding your problem and recommending data structures</p>
                </div>
              )}
              {loadingPhase === 'benchmark' && (
                <div>
                  <p className="text-white font-medium">⚡ Running Benchmarks...</p>
                  <p className="text-xs text-gray-400">Testing data structures in your browser to verify AI recommendation</p>
                </div>
              )}
            </div>
            {/* Phase indicator dots */}
            {mode === 'ai' && (
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${loadingPhase === 'ai' ? 'bg-brand-400 animate-pulse' : 'bg-brand-400'}`} />
                <div className="w-6 h-px bg-white/20" />
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${loadingPhase === 'benchmark' ? 'bg-emerald-400 animate-pulse' : 'bg-white/10'}`} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Inputs */}
      {!loading && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {mode === 'ai' ? (
            <ProblemInput onSubmit={handleAISubmit} loading={loading} />
          ) : (
            <BenchmarkConfig onSubmit={handleBenchmarkSubmit} loading={loading} />
          )}
        </motion.div>
      )}

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
      >
        {[
          { emoji: '🧠', title: 'AI Analysis', desc: 'Gemini-powered natural language analysis recommends the optimal data structure for your use case.' },
          { emoji: '⚡', title: 'Live Benchmarks', desc: 'Run insert, search, and delete benchmarks directly in your browser across 22 data structures.' },
          { emoji: '📊', title: 'Visual Dashboard', desc: 'Interactive charts comparing execution time, operations per second, and performance breakdown.' },
        ].map(({ emoji, title, desc }, i) => (
          <div key={i} className="glass-card-hover p-6 space-y-3">
            <div className="text-3xl">{emoji}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
