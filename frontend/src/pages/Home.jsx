import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkloadConfigurator from '../components/WorkloadConfigurator'

export default function Home({ onResults }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
          <span className="gradient-text">AI-Driven</span>
          <br />
          <span className="text-white">Data Structure Oracle</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Define your workload. Let the AI predict the optimal data structure.
          Then watch the C++ engine prove it in microseconds.
        </p>
      </motion.div>

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

      {/* Configurator */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <WorkloadConfigurator onSubmit={handleSubmit} loading={loading} />
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
      >
        {[
          { emoji: '🧠', title: 'AI Prediction', desc: 'Random Forest ML model trained on thousands of workloads predicts the optimal data structure.' },
          { emoji: '⚡', title: 'C++ Verification', desc: 'Hand-coded AVL, Red-Black, Splay, and Skip List trees benchmarked in microseconds.' },
          { emoji: '📊', title: 'Visual Dashboard', desc: 'Interactive charts comparing performance, memory, and AI explainability.' },
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
