import { motion } from 'framer-motion'
import ComparisonTable from './ComparisonTable'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function NLPResults({ prediction }) {
  const {
    identified_problem,
    winner,
    justification,
    alternatives,
    confidence,
    time_complexity,
    space_complexity,
    benchmark_suggestion,
  } = prediction

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Winner Hero Card */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center text-5xl animate-glow shrink-0"
            >
              🎯
            </motion.div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">AI Recommendation</p>
              <h2 className="text-4xl font-bold gradient-text">{winner}</h2>

              {/* Complexity badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {time_complexity && (
                  <span className="text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                    ⏱ {time_complexity}
                  </span>
                )}
                {space_complexity && (
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                    💾 {space_complexity}
                  </span>
                )}
                {confidence && (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
              </div>

              {identified_problem && (
                <p className="text-gray-300 italic pt-2 border-l-2 border-brand-500/50 pl-4 ml-2 sm:ml-0 text-sm">
                  "{identified_problem}"
                </p>
              )}
            </div>
          </div>

          {justification && (
            <div className="p-5 bg-brand-500/5 border border-brand-500/20 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <span>💡</span> Justification
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">{justification}</p>
            </div>
          )}

          {benchmark_suggestion && benchmark_suggestion.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>📊</span>
              <span>Benchmarked: {benchmark_suggestion.join(', ')}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Comparison Table — pass winner complexity */}
      <motion.div variants={item}>
        <ComparisonTable
          alternatives={alternatives}
          winner={winner}
          winnerComplexity={{
            time: time_complexity,
            space: space_complexity,
          }}
        />
      </motion.div>
    </motion.div>
  )
}
