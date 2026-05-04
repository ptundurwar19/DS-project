/**
 * Neuro-DS v2.0 — In-Browser Benchmark Runner
 * ==============================================
 * Generates workloads and benchmarks data structures in the browser.
 * Supports custom data input, configurable operation ratios, and workload presets.
 */

import { AVLTree, RedBlackTree, SplayTree, ThreadedBST, BTree, BPlusTree } from './structures/trees.js'
import { MinHeap, MaxHeap, FibonacciHeap, BinomialHeap, LeftistTree, SkewHeap, PairingHeap, DEPQ } from './structures/heaps.js'
import { Trie, CompressedTrie, DAWG, SuffixTree, SuffixArray, PositionHeap } from './structures/strings.js'
import { SkipList, Treap } from './structures/randomized.js'

/** Map DS id → constructor */
const DS_CONSTRUCTORS = {
  avl: AVLTree,
  rbt: RedBlackTree,
  splay: SplayTree,
  threaded_bst: ThreadedBST,
  btree: BTree,
  bplus_tree: BPlusTree,
  min_heap: MinHeap,
  max_heap: MaxHeap,
  fibonacci_heap: FibonacciHeap,
  binomial_heap: BinomialHeap,
  leftist_tree: LeftistTree,
  skew_heap: SkewHeap,
  pairing_heap: PairingHeap,
  depq: DEPQ,
  trie: Trie,
  compressed_trie: CompressedTrie,
  dawg: DAWG,
  suffix_tree: SuffixTree,
  suffix_array: SuffixArray,
  position_heap: PositionHeap,
  skip_list: SkipList,
  treap: Treap,
}

/** Categories that use string keys */
const STRING_DS = new Set(['trie', 'compressed_trie', 'dawg', 'suffix_tree', 'suffix_array', 'position_heap'])

/** DS where delete is not supported */
const NO_DELETE_DS = new Set(['dawg', 'suffix_tree', 'suffix_array', 'position_heap'])

/**
 * Generate random integer keys for benchmarking
 */
function generateIntKeys(n, max = 1000000) {
  const keys = []
  for (let i = 0; i < n; i++) keys.push(Math.floor(Math.random() * max))
  return keys
}

/**
 * Generate random string keys for benchmarking
 */
function generateStringKeys(n, minLen = 4, maxLen = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const keys = []
  for (let i = 0; i < n; i++) {
    const len = minLen + Math.floor(Math.random() * (maxLen - minLen))
    let s = ''
    for (let j = 0; j < len; j++) s += chars[Math.floor(Math.random() * chars.length)]
    keys.push(s)
  }
  return keys
}

/**
 * Workload presets for quick configuration
 */
export const WORKLOAD_PRESETS = {
  balanced: {
    label: 'Balanced',
    icon: '⚖️',
    description: 'Equal mix of all operations',
    insertRatio: 0.34,
    searchRatio: 0.33,
    deleteRatio: 0.33,
    suggestedDS: ['avl', 'rbt', 'skip_list', 'treap'],
  },
  read_heavy: {
    label: 'Read-Heavy',
    icon: '🔍',
    description: 'Mostly searches, few writes',
    insertRatio: 0.1,
    searchRatio: 0.8,
    deleteRatio: 0.1,
    suggestedDS: ['avl', 'rbt', 'btree', 'skip_list'],
  },
  write_heavy: {
    label: 'Write-Heavy',
    icon: '✏️',
    description: 'Frequent insertions and deletions',
    insertRatio: 0.5,
    searchRatio: 0.1,
    deleteRatio: 0.4,
    suggestedDS: ['rbt', 'splay', 'skip_list', 'treap'],
  },
  insert_only: {
    label: 'Insert-Only',
    icon: '➕',
    description: 'Bulk data loading, no reads or deletes',
    insertRatio: 1.0,
    searchRatio: 0.0,
    deleteRatio: 0.0,
    suggestedDS: ['rbt', 'skip_list', 'btree', 'bplus_tree'],
  },
  priority_queue: {
    label: 'Priority Queue',
    icon: '📋',
    description: 'Insert items, extract min/max frequently',
    insertRatio: 0.5,
    searchRatio: 0.1,
    deleteRatio: 0.4,
    suggestedDS: ['min_heap', 'max_heap', 'fibonacci_heap', 'binomial_heap', 'pairing_heap'],
  },
  string_search: {
    label: 'String Matching',
    icon: '🔤',
    description: 'Build dictionary, search for patterns',
    insertRatio: 0.3,
    searchRatio: 0.7,
    deleteRatio: 0.0,
    suggestedDS: ['trie', 'compressed_trie', 'dawg', 'suffix_array'],
  },
  cache_friendly: {
    label: 'Cache/Locality',
    icon: '🔄',
    description: 'Repeated access to recent elements',
    insertRatio: 0.2,
    searchRatio: 0.7,
    deleteRatio: 0.1,
    suggestedDS: ['splay', 'finger_search_tree', 'treap', 'skip_list'],
  },
  range_query: {
    label: 'Range Queries',
    icon: '📊',
    description: 'Sorted traversal and range lookups',
    insertRatio: 0.3,
    searchRatio: 0.6,
    deleteRatio: 0.1,
    suggestedDS: ['btree', 'bplus_tree', 'avl', 'skip_list'],
  },
}

/**
 * Suggest the best DS to compare based on operation ratios
 */
export function suggestDS(insertRatio, searchRatio, deleteRatio) {
  const suggestions = new Set()

  // Always include these as baseline
  suggestions.add('avl')
  suggestions.add('rbt')

  if (searchRatio > 0.6) {
    // Read-heavy → balanced trees excel
    suggestions.add('btree')
    suggestions.add('skip_list')
  }

  if (insertRatio > 0.4 || deleteRatio > 0.3) {
    // Write-heavy → relaxed balancing wins
    suggestions.add('splay')
    suggestions.add('treap')
    suggestions.add('skip_list')
  }

  if (deleteRatio > 0.3) {
    // Delete-heavy → heaps for priority queue patterns
    suggestions.add('min_heap')
    suggestions.add('fibonacci_heap')
    suggestions.add('pairing_heap')
  }

  if (insertRatio > 0.7) {
    // Insert-dominant → B-tree variants
    suggestions.add('btree')
    suggestions.add('bplus_tree')
  }

  // Cap at 6 suggestions
  return [...suggestions].slice(0, 6)
}

/**
 * Run benchmark for a single data structure
 * @param {string} dsId - Data structure ID from registry
 * @param {object} config - { datasetSize, insertRatio, searchRatio, deleteRatio, customInsert, customSearch, customDelete }
 * @returns {object} Benchmark results
 */
export function benchmarkSingle(dsId, config) {
  const {
    datasetSize = 5000,
    insertRatio = 0.34,
    searchRatio = 0.33,
    deleteRatio = 0.33,
    customInsert = null,
    customSearch = null,
    customDelete = null,
  } = config

  const Constructor = DS_CONSTRUCTORS[dsId]
  if (!Constructor) return { error: `Unknown DS: ${dsId}` }

  const isString = STRING_DS.has(dsId)
  const noDelete = NO_DELETE_DS.has(dsId)

  // Determine keys: use custom data if provided, else generate random
  let insertKeys, searchKeys, deleteKeys

  if (customInsert && customInsert.length > 0) {
    // Custom data mode — user specified the operations
    insertKeys = customInsert
    searchKeys = customSearch && customSearch.length > 0 ? customSearch : customInsert
    deleteKeys = noDelete ? [] : (customDelete && customDelete.length > 0 ? customDelete : customInsert.slice(0, Math.floor(customInsert.length / 2)))
  } else {
    // Auto-generate mode — use ratios to determine operation counts
    const total = datasetSize
    const insertCount = Math.max(1, Math.round(total * insertRatio))
    const searchCount = Math.round(total * searchRatio)
    const deleteCount = noDelete ? 0 : Math.round(total * deleteRatio)

    const allKeys = isString ? generateStringKeys(insertCount) : generateIntKeys(insertCount)
    insertKeys = allKeys
    searchKeys = searchCount > 0 ? allKeys.slice(0, Math.min(searchCount, allKeys.length)) : []
    // For search, also include some keys not inserted (to test miss path)
    if (searchCount > allKeys.length) {
      const extraKeys = isString ? generateStringKeys(searchCount - allKeys.length) : generateIntKeys(searchCount - allKeys.length)
      searchKeys = [...allKeys, ...extraKeys].slice(0, searchCount)
    }
    deleteKeys = noDelete ? [] : allKeys.slice(0, Math.min(deleteCount, allKeys.length))
  }

  const ds = new Constructor()

  // Benchmark INSERT
  let insertTime = 0
  if (insertKeys.length > 0) {
    const start = performance.now()
    for (const k of insertKeys) ds.insert(k)
    insertTime = performance.now() - start
  }

  // Benchmark SEARCH
  let searchTime = 0, searchHits = 0
  if (searchKeys.length > 0) {
    const start = performance.now()
    for (const k of searchKeys) { if (ds.search(k)) searchHits++ }
    searchTime = performance.now() - start
  }

  // Benchmark DELETE
  let deleteTime = 0
  if (!noDelete && deleteKeys.length > 0) {
    const start = performance.now()
    for (const k of deleteKeys) ds.delete(k)
    deleteTime = performance.now() - start
  }

  const totalTime = insertTime + searchTime + deleteTime
  const totalOps = insertKeys.length + searchKeys.length + deleteKeys.length

  return {
    dsId,
    insertTime: Math.round(insertTime * 100) / 100,
    searchTime: Math.round(searchTime * 100) / 100,
    deleteTime: Math.round(deleteTime * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
    insertOps: insertKeys.length,
    searchOps: searchKeys.length,
    deleteOps: deleteKeys.length,
    totalOps,
    searchHitRate: searchKeys.length > 0 ? Math.round((searchHits / searchKeys.length) * 100) : 0,
    opsPerSec: totalTime > 0 ? Math.round(totalOps / (totalTime / 1000)) : 0,
    supportsDelete: !noDelete,
  }
}

/**
 * Run benchmark for multiple data structures
 * @param {string[]} dsIds - Array of DS IDs to benchmark
 * @param {object} config - { datasetSize, insertRatio, searchRatio, deleteRatio, customInsert, customSearch, customDelete }
 * @param {function} onProgress - Callback with (dsId, result, index, total)
 * @returns {Promise<object[]>} Array of benchmark results
 */
export async function runBenchmark(dsIds, config, onProgress = null) {
  const results = []
  for (let i = 0; i < dsIds.length; i++) {
    const dsId = dsIds[i]

    // Yield to UI between benchmarks
    await new Promise(resolve => setTimeout(resolve, 10))

    const result = benchmarkSingle(dsId, config)
    results.push(result)

    if (onProgress) onProgress(dsId, result, i + 1, dsIds.length)
  }

  // Sort by total time (fastest first)
  results.sort((a, b) => a.totalTime - b.totalTime)

  // Add rank
  results.forEach((r, i) => { r.rank = i + 1 })

  return results
}

/**
 * Get the winner from benchmark results
 */
export function getWinner(results) {
  if (!results || results.length === 0) return null
  return results[0]
}

/**
 * Get available DS IDs
 */
export function getAvailableDS() {
  return Object.keys(DS_CONSTRUCTORS)
}
