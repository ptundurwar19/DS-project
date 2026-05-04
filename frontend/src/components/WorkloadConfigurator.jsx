import { useState } from 'react'
import { motion } from 'framer-motion'

const DS_COLORS = {
  avl: '#6366f1',
  redblack: '#ec4899',
  splay: '#f59e0b',
  skiplist: '#10b981',
}

const DS_NAMES = {
  avl: 'AVL Tree',
  redblack: 'Red-Black Tree',
  splay: 'Splay Tree',
  skiplist: 'Skip List',
}

const defaultConfig = {
  dataset_size: 10000,
  read_ratio: 0.5,
  write_ratio: 0.4,
  delete_ratio: 0.1,
  sortedness: 0.0,
  temporal_locality: 0.0,
}

const sliders = [
  { key: 'dataset_size', label: 'Dataset Size', min: 100, max: 200000, step: 100, format: (v) => v.toLocaleString(), icon: '📦' },
  { key: 'read_ratio', label: 'Read Ratio', min: 0, max: 1, step: 0.05, format: (v) => `${(v * 100).toFixed(0)}%`, icon: '🔍' },
  { key: 'write_ratio', label: 'Write Ratio', min: 0, max: 1, step: 0.05, format: (v) => `${(v * 100).toFixed(0)}%`, icon: '✏️' },
  { key: 'delete_ratio', label: 'Delete Ratio', min: 0, max: 1, step: 0.05, format: (v) => `${(v * 100).toFixed(0)}%`, icon: '🗑️' },
  { key: 'sortedness', label: 'Sortedness', min: 0, max: 1, step: 0.05, format: (v) => `${(v * 100).toFixed(0)}%`, icon: '📈' },
  { key: 'temporal_locality', label: 'Temporal Locality', min: 0, max: 1, step: 0.05, format: (v) => `${(v * 100).toFixed(0)}%`, icon: '🕐' },
]

export default function WorkloadConfigurator({ onSubmit, loading }) {
  const [config, setConfig] = useState(defaultConfig)

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: parseFloat(value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(config)
  }

  // Compute operation mix for the visual bar
  const total = config.read_ratio + config.write_ratio + config.delete_ratio
  const readPct = total > 0 ? (config.read_ratio / total) * 100 : 33
  const writePct = total > 0 ? (config.write_ratio / total) * 100 : 33
  const deletePct = total > 0 ? (config.delete_ratio / total) * 100 : 34

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center text-xl">
            ⚙️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Workload Configuration</h2>
            <p className="text-sm text-gray-400">Define your data access pattern</p>
          </div>
        </div>

        {/* Sliders */}
        {sliders.map(({ key, label, min, max, step, format, icon }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span>{icon}</span> {label}
              </label>
              <span className="text-sm font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                {format(config[key])}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={config[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="slider-track w-full"
            />
          </div>
        ))}

        {/* Operation mix bar */}
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-gray-300">Operation Mix</p>
          <div className="h-3 rounded-full overflow-hidden flex">
            <div
              className="transition-all duration-300"
              style={{ width: `${readPct}%`, background: '#6366f1' }}
              title={`Read: ${readPct.toFixed(0)}%`}
            />
            <div
              className="transition-all duration-300"
              style={{ width: `${writePct}%`, background: '#f59e0b' }}
              title={`Write: ${writePct.toFixed(0)}%`}
            />
            <div
              className="transition-all duration-300"
              style={{ width: `${deletePct}%`, background: '#ef4444' }}
              title={`Delete: ${deletePct.toFixed(0)}%`}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-500" /> Read {readPct.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Write {writePct.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Delete {deletePct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running Analysis...
          </>
        ) : (
          <>🧠 Run Analysis</>
        )}
      </motion.button>
    </form>
  )
}
