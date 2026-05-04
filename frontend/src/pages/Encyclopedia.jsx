import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DS_REGISTRY, DS_CATEGORIES, getDSGrouped } from '../engine/dsRegistry'

const grouped = getDSGrouped()

/** Use-case examples for each DS */
const USE_CASES = {
  avl: ['Databases requiring strict balance', 'Real-time systems with guaranteed latency', 'In-memory sorted dictionaries'],
  rbt: ['Language standard libraries (std::map, TreeMap)', 'Linux kernel scheduling', 'When frequent insertions/deletions are needed'],
  splay: ['Cache implementations', 'Network routers (IP lookup)', 'Recently accessed data patterns'],
  threaded_bst: ['In-order traversal without stack', 'Iterator-based tree scanning', 'Memory-constrained environments'],
  btree: ['Database indexing (MySQL, PostgreSQL)', 'Filesystem metadata (NTFS, ext4)', 'Disk-based sorted data'],
  bplus_tree: ['Database range queries', 'Sequential scan operations', 'File systems with ordered access'],
  min_heap: ['Priority queue (Dijkstra, Prim)', 'OS task scheduling', 'Finding K smallest elements'],
  max_heap: ['Finding K largest elements', 'Median maintenance', 'Priority queue (max priority)'],
  fibonacci_heap: ['Dijkstra shortest path (optimal)', 'Prim MST algorithm', 'Amortized O(1) decrease-key operations'],
  binomial_heap: ['Mergeable priority queues', 'Event-driven simulation', 'When frequent heap merges are needed'],
  leftist_tree: ['Merge-intensive workloads', 'Distributed priority queues', 'Online median algorithms'],
  skew_heap: ['Simple merge-based priority queue', 'When worst-case doesn\'t matter', 'Functional programming'],
  pairing_heap: ['Practical priority queue (fast in practice)', 'Graph algorithms', 'When simplicity + speed matters'],
  depq: ['Sliding window min/max', 'Bandwidth management', 'When both min and max extraction needed'],
  trie: ['Autocomplete systems', 'Spell checkers', 'IP routing tables'],
  compressed_trie: ['Memory-efficient dictionaries', 'Genome sequence storage', 'URL routing in web frameworks'],
  dawg: ['Scrabble word validation', 'Compact dictionary storage', 'Substring matching'],
  suffix_tree: ['Pattern matching in DNA sequences', 'Text editors (find/replace)', 'Longest repeated substring'],
  suffix_array: ['Space-efficient text indexing', 'Bioinformatics', 'Full-text search engines'],
  position_heap: ['Approximate string matching', 'Text indexing with positions', 'Pattern occurrence counting'],
  skip_list: ['Concurrent data structures', 'Redis sorted sets', 'When tree balancing is too complex'],
  treap: ['Randomized BST applications', 'Implicit key sequences', 'When simple balanced BST needed'],
}

export default function Encyclopedia() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedDS, setExpandedDS] = useState(null)

  const filteredDS = useMemo(() => {
    let items = Object.values(DS_REGISTRY)
    if (activeCategory !== 'all') {
      items = items.filter(ds => ds.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(ds =>
        ds.name.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.id.toLowerCase().includes(q)
      )
    }
    return items
  }, [search, activeCategory])

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white">📚 Data Structure Encyclopedia</h1>
        <p className="text-gray-400 mt-1">Explore all 22 data structures — complexity, use cases, and when to use them</p>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search data structures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            All ({Object.keys(DS_REGISTRY).length})
          </button>
          {Object.entries(DS_CATEGORIES).map(([key, cat]) => {
            const count = Object.values(DS_REGISTRY).filter(ds => ds.category === key).length
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === key
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                <span>{cat.icon}</span> {cat.label.split(' ')[0]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* DS Cards Grid */}
      {filteredDS.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-gray-400">No data structures found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredDS.map((ds) => {
              const cat = DS_CATEGORIES[ds.category]
              const isExpanded = expandedDS === ds.id
              const useCases = USE_CASES[ds.id] || []

              return (
                <motion.div
                  key={ds.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpandedDS(isExpanded ? null : ds.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat?.icon}</span>
                          <h3 className="text-lg font-bold text-white">{ds.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{ds.description}</p>

                        {/* Complexity chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                            Insert: {ds.complexity.insert.avg}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                            Search: {ds.complexity.search.avg}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
                            Delete: {ds.complexity.delete.avg}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
                            Space: {ds.complexity.space}
                          </span>
                        </div>
                      </div>

                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-gray-500 text-sm mt-1"
                      >
                        ▼
                      </motion.span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                          {/* Complexity Table */}
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Complexity Analysis</p>
                            <div className="rounded-lg border border-white/10 overflow-hidden">
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead className="bg-white/5">
                                  <tr>
                                    {['Operation', 'Average', 'Worst Case'].map(h => (
                                      <th key={h} style={{ padding: '8px 12px', fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {['insert', 'search', 'delete'].map(op => (
                                    <tr key={op} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#d1d5db', fontWeight: 500, textTransform: 'capitalize' }}>{op}</td>
                                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#a5b4fc', fontFamily: 'monospace' }}>{ds.complexity[op]?.avg}</td>
                                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#f87171', fontFamily: 'monospace' }}>{ds.complexity[op]?.worst}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Use Cases */}
                          {useCases.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">When to Use</p>
                              <ul className="space-y-1">
                                {useCases.map((uc, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-brand-400 mt-0.5 text-xs">▸</span>
                                    {uc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2">
                            <Link
                              to="/benchmark"
                              className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
                            >
                              ⚡ Benchmark this DS
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
