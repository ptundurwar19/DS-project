import { useState } from 'react'
import { motion } from 'framer-motion'

const EXAMPLES = [
  "I need a system that can quickly find all 2D points within a specific geographical rectangular region.",
  "Design an autocomplete system that suggests words as users type, supporting prefix-based search.",
  "I need a data structure for a real-time priority scheduling system where tasks can be dynamically inserted and the highest-priority task extracted.",
  "Build an efficient system to find overlapping time intervals for a calendar application.",
  "I need to maintain a sorted set of integers supporting fast predecessor/successor queries.",
]

export default function ProblemInput({ onSubmit, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ nlp_mode: true, problem_text: text.trim() })
  }

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🧠</span> AI Advisor
        </h2>
        <p className="text-sm text-gray-400">
          Describe your problem and the AI will analyze it to recommend the optimal data structure,
          then automatically benchmark the top candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            📝 Problem Description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I need a data structure that supports fast insertion and can efficiently find the minimum element..."
            className="w-full h-36 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            required
          />
        </div>

        {/* Quick examples */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(ex)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all truncate max-w-[200px]"
              >
                {ex.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🧠 Analyze & Benchmark
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
