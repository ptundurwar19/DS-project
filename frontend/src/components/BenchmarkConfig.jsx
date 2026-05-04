import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DS_CATEGORIES, DS_REGISTRY, getDSGrouped } from '../engine/dsRegistry'
import { WORKLOAD_PRESETS, suggestDS } from '../engine/benchmarkRunner'

const grouped = getDSGrouped()

export default function BenchmarkConfig({ onSubmit, loading }) {
  const [selectedDS, setSelectedDS] = useState(['avl', 'rbt', 'splay', 'skip_list'])
  const [datasetSize, setDatasetSize] = useState(5000)
  const [insertRatio, setInsertRatio] = useState(0.34)
  const [searchRatio, setSearchRatio] = useState(0.33)
  const [deleteRatio, setDeleteRatio] = useState(0.33)
  const [activePreset, setActivePreset] = useState(null)
  const [showCustomData, setShowCustomData] = useState(false)
  const [customInsertText, setCustomInsertText] = useState('')
  const [customSearchText, setCustomSearchText] = useState('')
  const [customDeleteText, setCustomDeleteText] = useState('')
  const [showAllDS, setShowAllDS] = useState(false)

  // Smart DS suggestions based on current operation mix
  const smartSuggestions = useMemo(
    () => suggestDS(insertRatio, searchRatio, deleteRatio),
    [insertRatio, searchRatio, deleteRatio]
  )

  const normalizeRatios = (field, value) => {
    const v = parseFloat(value)
    if (field === 'insert') {
      const remaining = 1 - v
      const oldSum = searchRatio + deleteRatio
      if (oldSum > 0) {
        setInsertRatio(v)
        setSearchRatio(Math.round((searchRatio / oldSum) * remaining * 100) / 100)
        setDeleteRatio(Math.round((deleteRatio / oldSum) * remaining * 100) / 100)
      } else {
        setInsertRatio(v)
        setSearchRatio(Math.round(remaining / 2 * 100) / 100)
        setDeleteRatio(Math.round(remaining / 2 * 100) / 100)
      }
    } else if (field === 'search') {
      const remaining = 1 - v
      const oldSum = insertRatio + deleteRatio
      if (oldSum > 0) {
        setSearchRatio(v)
        setInsertRatio(Math.round((insertRatio / oldSum) * remaining * 100) / 100)
        setDeleteRatio(Math.round((deleteRatio / oldSum) * remaining * 100) / 100)
      } else {
        setSearchRatio(v)
        setInsertRatio(Math.round(remaining / 2 * 100) / 100)
        setDeleteRatio(Math.round(remaining / 2 * 100) / 100)
      }
    } else {
      const remaining = 1 - v
      const oldSum = insertRatio + searchRatio
      if (oldSum > 0) {
        setDeleteRatio(v)
        setInsertRatio(Math.round((insertRatio / oldSum) * remaining * 100) / 100)
        setSearchRatio(Math.round((searchRatio / oldSum) * remaining * 100) / 100)
      } else {
        setDeleteRatio(v)
        setInsertRatio(Math.round(remaining / 2 * 100) / 100)
        setSearchRatio(Math.round(remaining / 2 * 100) / 100)
      }
    }
    setActivePreset(null)
  }

  const applyPreset = (key) => {
    const preset = WORKLOAD_PRESETS[key]
    setInsertRatio(preset.insertRatio)
    setSearchRatio(preset.searchRatio)
    setDeleteRatio(preset.deleteRatio)
    setSelectedDS(preset.suggestedDS)
    setActivePreset(key)
    setShowCustomData(false)
    setCustomInsertText('')
    setCustomSearchText('')
    setCustomDeleteText('')
  }

  const applySuggestions = () => {
    setSelectedDS(smartSuggestions)
  }

  const toggleDS = (id) => {
    setSelectedDS(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
    setActivePreset(null)
  }

  const selectCategory = (catKey) => {
    const catDS = Object.values(DS_REGISTRY).filter(d => d.category === catKey).map(d => d.id)
    const allSelected = catDS.every(id => selectedDS.includes(id))
    if (allSelected) setSelectedDS(prev => prev.filter(id => !catDS.includes(id)))
    else setSelectedDS(prev => [...new Set([...prev, ...catDS])])
    setActivePreset(null)
  }

  const parseCustomData = (text) => {
    if (!text.trim()) return null
    return text.split(/[,\s\n]+/).filter(v => v.trim() !== '').map(v => {
      const num = Number(v.trim())
      return isNaN(num) ? v.trim() : num
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedDS.length < 2) return

    const config = { selectedDS, datasetSize, insertRatio, searchRatio, deleteRatio }

    // Add custom data if provided
    if (showCustomData) {
      config.customInsert = parseCustomData(customInsertText)
      config.customSearch = parseCustomData(customSearchText)
      config.customDelete = parseCustomData(customDeleteText)
    }

    onSubmit(config)
  }

  // Operation mix visualization
  const insertPct = Math.round(insertRatio * 100)
  const searchPct = Math.round(searchRatio * 100)
  const deletePct = Math.round(deleteRatio * 100)

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Workload Presets */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-base">🎯</div>
          <div>
            <h3 className="text-base font-bold text-white">Workload Presets</h3>
            <p className="text-xs text-gray-400">Quick setup for common use cases</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(WORKLOAD_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`p-3 rounded-xl border text-left transition-all duration-200
                ${activePreset === key
                  ? 'bg-brand-500/15 border-brand-500/40 ring-1 ring-brand-500/30'
                  : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/15'
                }`}
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <p className={`text-sm font-semibold ${activePreset === key ? 'text-brand-400' : 'text-gray-200'}`}>{preset.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Config */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center text-xl">⚡</div>
          <div>
            <h2 className="text-xl font-bold text-white">Benchmark Configuration</h2>
            <p className="text-sm text-gray-400">Define your workload pattern and data</p>
          </div>
        </div>

        {/* Operation Mix Sliders */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-300">Operation Mix</p>

          {/* Visual bar */}
          <div className="space-y-2">
            <div className="h-3 rounded-full overflow-hidden flex">
              <div className="transition-all duration-300" style={{ width: `${insertPct}%`, background: '#6366f1' }} title={`Insert: ${insertPct}%`} />
              <div className="transition-all duration-300" style={{ width: `${searchPct}%`, background: '#10b981' }} title={`Search: ${searchPct}%`} />
              <div className="transition-all duration-300" style={{ width: `${deletePct}%`, background: '#f59e0b' }} title={`Delete: ${deletePct}%`} />
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Insert {insertPct}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Search {searchPct}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Delete {deletePct}%</span>
            </div>
          </div>

          {/* Individual sliders */}
          {[
            { key: 'insert', label: '➕ Insert', value: insertRatio, color: '#6366f1' },
            { key: 'search', label: '🔍 Search', value: searchRatio, color: '#10b981' },
            { key: 'delete', label: '🗑️ Delete', value: deleteRatio, color: '#f59e0b' },
          ].map(({ key, label, value, color }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">{label}</label>
                <span className="text-sm font-mono px-2 py-0.5 rounded" style={{ color, background: `${color}15` }}>
                  {Math.round(value * 100)}%
                </span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01}
                value={value}
                onChange={(e) => normalizeRatios(key, e.target.value)}
                className="slider-track w-full"
              />
            </div>
          ))}
        </div>

        {/* Dataset Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">📦 Dataset Size</label>
            <span className="text-sm font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
              {datasetSize.toLocaleString()} operations
            </span>
          </div>
          <input
            type="range" min={100} max={50000} step={100}
            value={datasetSize}
            onChange={(e) => setDatasetSize(parseInt(e.target.value))}
            className="slider-track w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>100</span><span>10K</span><span>25K</span><span>50K</span>
          </div>
        </div>

        {/* Custom Data Toggle */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowCustomData(!showCustomData)}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            <motion.span animate={{ rotate: showCustomData ? 90 : 0 }} transition={{ duration: 0.2 }}>▶</motion.span>
            📝 Custom Data Input
            <span className="text-xs text-gray-500">(optional — provide your own values)</span>
          </button>

          <AnimatePresence>
            {showCustomData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-3"
              >
                <p className="text-xs text-gray-500">
                  Enter values separated by commas, spaces, or newlines. Numbers or strings supported.
                  Custom data overrides the random generation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-indigo-400">➕ Insert Values</label>
                    <textarea
                      value={customInsertText}
                      onChange={(e) => setCustomInsertText(e.target.value)}
                      placeholder="42, 17, 88, 5, 23..."
                      className="w-full h-20 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                    />
                    {customInsertText && (
                      <p className="text-xs text-gray-500">{parseValues(customInsertText)} values</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-emerald-400">🔍 Search Values</label>
                    <textarea
                      value={customSearchText}
                      onChange={(e) => setCustomSearchText(e.target.value)}
                      placeholder="42, 99, 17, 50..."
                      className="w-full h-20 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none font-mono"
                    />
                    {customSearchText && (
                      <p className="text-xs text-gray-500">{parseValues(customSearchText)} values</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-400">🗑️ Delete Values</label>
                    <textarea
                      value={customDeleteText}
                      onChange={(e) => setCustomDeleteText(e.target.value)}
                      placeholder="42, 5..."
                      className="w-full h-20 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
                    />
                    {customDeleteText && (
                      <p className="text-xs text-gray-500">{parseValues(customDeleteText)} values</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Smart DS Suggestions */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">
              🧠 Suggested Data Structures
              <span className="text-xs text-gray-500 ml-2">based on your workload</span>
            </p>
            <button
              type="button"
              onClick={applySuggestions}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium px-3 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-all"
            >
              Apply Suggestions
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map(dsId => {
              const ds = DS_REGISTRY[dsId]
              const isSelected = selectedDS.includes(dsId)
              return (
                <button
                  key={dsId}
                  type="button"
                  onClick={() => toggleDS(dsId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all
                    ${isSelected
                      ? 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                      : 'bg-white/3 border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: isSelected ? ds?.color : '#6b7280' }} />
                  {ds?.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Full DS Selection (collapsible) */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowAllDS(!showAllDS)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <motion.span animate={{ rotate: showAllDS ? 90 : 0 }} transition={{ duration: 0.2 }}>▶</motion.span>
              All Data Structures ({selectedDS.length} selected)
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedDS(selectedDS.length === Object.keys(DS_REGISTRY).length ? [] : Object.keys(DS_REGISTRY)) }}
              className="text-xs text-brand-400 hover:text-brand-300"
            >
              {selectedDS.length === Object.keys(DS_REGISTRY).length ? 'Deselect All' : 'Select All'}
            </button>
          </button>

          <AnimatePresence>
            {showAllDS && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                {Object.entries(grouped).map(([catKey, cat]) => (
                  <div key={catKey} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selectCategory(catKey)}
                      className="flex items-center gap-2 text-sm font-semibold hover:text-white transition-colors"
                      style={{ color: cat.color }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className="text-xs text-gray-500 font-normal">({cat.structures.length})</span>
                    </button>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pl-6">
                      {cat.structures.map(ds => {
                        const isSelected = selectedDS.includes(ds.id)
                        return (
                          <button
                            key={ds.id}
                            type="button"
                            onClick={() => toggleDS(ds.id)}
                            className={`text-left p-3 rounded-xl border text-sm transition-all duration-200
                              ${isSelected
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full border-2 transition-all ${isSelected ? 'border-brand-400 bg-brand-400' : 'border-gray-500'}`} />
                              <span className="font-medium truncate">{ds.name}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading || selectedDS.length < 2}
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
            Running Benchmark...
          </>
        ) : (
          <>⚡ Run Benchmark ({selectedDS.length} structures)</>
        )}
      </motion.button>
    </form>
  )
}

function parseValues(text) {
  return text.split(/[,\s\n]+/).filter(v => v.trim() !== '').length
}
