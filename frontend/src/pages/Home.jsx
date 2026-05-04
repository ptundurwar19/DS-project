import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkloadConfigurator from '../components/WorkloadConfigurator'
import ProblemInput from '../components/ProblemInput'

export default function Home({ onResults }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('nlp') // 'nlp' | 'benchmark'

  const handleSubmit = async (config) => {
    setLoading(true)
    setError(null)

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
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
          <span className="gradient-text">Smart</span>
          <br />
          <span className="text-white">Data Structure Selector</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Describe your problem to our NLP engine, or define a synthetic workload to benchmark against our C++ implementation.
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/50 p-1 rounded-full border border-white/5 inline-flex relative">
          {/* Animated Background Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 bg-gradient-to-r from-brand-600 to-purple-600 rounded-full"
            initial={false}
            animate={{
              left: mode === 'nlp' ? '4px' : '50%',
              width: 'calc(50% - 4px)',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />

          <button
            onClick={() => setMode('nlp')}
            className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors w-48 rounded-full ${mode === 'nlp' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            🧠 NLP Problem
          </button>
          <button
            onClick={() => setMode('benchmark')}
            className={`relative z-10 px-6 py-2.5 text-sm font-semibold transition-colors w-48 rounded-full ${mode === 'benchmark' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ C++ Benchmark
          </button>
        </div>
      </div>

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
      <motion.div
        key={mode} // Forces re-animation when mode changes
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {mode === 'nlp' ? (
          <ProblemInput onSubmit={handleSubmit} loading={loading} />
        ) : (
          <WorkloadConfigurator onSubmit={handleSubmit} loading={loading} />
        )}
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
      >
        {[
          { emoji: '🧠', title: 'Smart Prediction', desc: 'Use NLP to understand the problem description and suggest the best data structure.' },
          { emoji: '⚡', title: 'C++ Verification', desc: 'Benchmarks C++ implementations of data structures for speed and memory efficiency.' },
          { emoji: '📊', title: 'Visual Dashboard', desc: 'Interactive charts comparing performance, memory, and explainability.' },
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
