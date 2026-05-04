import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PredictionCard from '../components/PredictionCard'
import BenchmarkChart from '../components/BenchmarkChart'
import ParetoChart from '../components/ParetoChart'
import ExplainPanel from '../components/ExplainPanel'
import CodeExport from '../components/CodeExport'
import NLPResults from '../components/NLPResults'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Dashboard({ results }) {
  const navigate = useNavigate()

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="text-6xl">🧠</div>
        <h2 className="text-2xl font-bold text-white">No Results Yet</h2>
        <p className="text-gray-400">Run a search first to see your dashboard.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          ← Go to Home
        </button>
      </div>
    )
  }

  const { prediction, benchmark, features, ai_correct, metadata } = results
  const isNLPMode = metadata?.mode === 'nlp_gemini'

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Results Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {isNLPMode ? 'Natural Language Analysis' : 'Prediction vs. Ground Truth Verification'}
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary whitespace-nowrap">
          ⚡ New Run
        </button>
      </motion.div>

      {isNLPMode ? (
        /* --- NLP NLP UI --- */
        <motion.div variants={item}>
          <NLPResults prediction={prediction} />
        </motion.div>
      ) : (
        /* --- Old Setup (C++ Engine) UI --- */
        <>
          <motion.div variants={item}>
            <PredictionCard prediction={prediction} aiCorrect={ai_correct} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <BenchmarkChart benchmark={benchmark} winner={prediction.winner} />
            </motion.div>
            <motion.div variants={item}>
              <ParetoChart benchmark={benchmark} winner={prediction.winner} />
            </motion.div>
          </div>

          <motion.div variants={item}>
            <ExplainPanel prediction={prediction} features={features} />
          </motion.div>

          <motion.div variants={item}>
            <CodeExport winner={prediction.winner} />
          </motion.div>

          {metadata && (
            <motion.div variants={item} className="glass-card p-4 text-xs text-gray-500 flex items-center justify-between">
              <span>Engine: {metadata.compiler || 'N/A'}</span>
              <span>Dataset: {metadata.dataset_size?.toLocaleString() || 'N/A'} operations</span>
              {metadata.error && <span className="text-amber-400">⚠️ {metadata.error}</span>}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
