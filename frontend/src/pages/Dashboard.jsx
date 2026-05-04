import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import NLPResults from '../components/NLPResults'
import BenchmarkResults from '../components/BenchmarkResults'
import ExportPanel from '../components/ExportPanel'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Dashboard({ results, benchmarkResults }) {
  const navigate = useNavigate()

  const hasAI = results && results.prediction
  const hasBenchmark = benchmarkResults && benchmarkResults.length > 0

  if (!hasAI && !hasBenchmark) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="text-6xl">🧠</div>
        <h2 className="text-2xl font-bold text-white">No Results Yet</h2>
        <p className="text-gray-400">Run an AI analysis or benchmark to see results here.</p>
        <button onClick={() => navigate('/')} className="btn-primary">← Go to Home</button>
      </div>
    )
  }

  const prediction = hasAI ? results.prediction : null

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Results Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {hasAI && hasBenchmark
              ? 'AI Analysis + Live Benchmark Verification'
              : hasAI
                ? 'AI-Powered Analysis'
                : 'Live Benchmark Results'
            }
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary whitespace-nowrap">
          ⚡ New Run
        </button>
      </motion.div>

      {/* AI Results Section */}
      {hasAI && (
        <motion.div variants={item}>
          <NLPResults prediction={prediction} />
        </motion.div>
      )}

      {/* Benchmark Results Section */}
      {hasBenchmark && (
        <motion.div variants={item}>
          <BenchmarkResults
            results={benchmarkResults}
            aiWinner={prediction?.winner}
          />
        </motion.div>
      )}

      {/* Export Panel */}
      <motion.div variants={item}>
        <ExportPanel
          results={benchmarkResults}
          aiResult={prediction}
        />
      </motion.div>
    </motion.div>
  )
}
