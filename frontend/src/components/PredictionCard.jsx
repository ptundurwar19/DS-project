import { motion } from 'framer-motion'

const DS_NAMES = {
  avl: 'AVL Tree',
  redblack: 'Red-Black Tree',
  splay: 'Splay Tree',
  skiplist: 'Skip List',
}

const DS_ICONS = {
  avl: '🌳',
  redblack: '🔴',
  splay: '🔄',
  skiplist: '⏫',
}

export default function PredictionCard({ prediction, aiCorrect }) {
  const { winner, confidence } = prediction
  const pct = (confidence * 100).toFixed(1)

  return (
    <div className="glass-card overflow-hidden">
      {/* Gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

      <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Left: Pick */}
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center text-4xl animate-glow"
          >
            {DS_ICONS[winner] || '🧠'}
          </motion.div>
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Prediction</p>
            <h2 className="text-3xl font-bold gradient-text mt-1">
              {DS_NAMES[winner] || winner}
            </h2>
          </div>
        </div>

        {/* Right: Confidence + Correctness */}
        <div className="flex items-center gap-6">
          {/* Confidence ring */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="35" fill="none"
                stroke="url(#grad)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - confidence) }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{pct}%</span>
            </div>
          </div>

          {/* Correctness badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <span className={aiCorrect ? 'badge-correct text-base px-4 py-2' : 'badge-incorrect text-base px-4 py-2'}>
              {aiCorrect ? '✓ Prediction Correct' : '✗ Prediction Wrong'}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
