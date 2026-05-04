import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProblemInput({ onSubmit, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    onSubmit({
      nlp_mode: true,
      problem_text: text.trim()
    })
  }

  return (
    <div className="glass-card p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🧠</span> Problem Resolver
        </h2>
        <p className="text-sm text-gray-400">
          Paste your problem statement below. It will analyze it against the syllabus to find the absolutely perfect data structure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Problem Statement Text Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            📝 Problem Description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I need a system that can quickly find all 2D points within a specific geographical rectangular region..."
            className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            required
          />
        </div>

        {/* Submit Button */}
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
              Analyzing Syllabus...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Search Data Structure
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
