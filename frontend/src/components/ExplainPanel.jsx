import { motion } from 'framer-motion'

const FEATURE_LABELS = {
  read_ratio: 'Read Ratio',
  write_ratio: 'Write Ratio',
  delete_ratio: 'Delete Ratio',
  dataset_size: 'Dataset Size',
  sortedness: 'Sortedness',
  duplicate_ratio: 'Duplicate Ratio',
  temporal_locality: 'Temporal Locality',
  key_spread: 'Key Spread',
}

export default function ExplainPanel({ prediction, features }) {
  const { explanation, feature_importances } = prediction

  // Sort importances descending
  const sortedImportances = Object.entries(feature_importances || {})
    .sort(([, a], [, b]) => b - a)

  const maxImportance = sortedImportances.length > 0 ? sortedImportances[0][1] : 1

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">💡</span>
        <h3 className="text-lg font-semibold text-white">Explainability — Why This Pick?</h3>
      </div>

      {/* Natural language explanation */}
      <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
        <p className="text-gray-300 leading-relaxed text-sm italic">
          "{explanation}"
        </p>
      </div>

      {/* Feature importances */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Feature Importances</p>
        {sortedImportances.map(([key, value], i) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{FEATURE_LABELS[key] || key}</span>
              <span className="font-mono text-brand-400">{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxImportance) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Extracted features */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Extracted Features</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(features || {}).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-gray-500">{FEATURE_LABELS[key] || key}</p>
              <p className="text-lg font-mono text-white mt-1">
                {typeof value === 'number' ? value.toFixed(3) : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
