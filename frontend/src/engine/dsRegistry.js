/**
 * Neuro-DS v2.0 — Data Structure Registry
 * ==========================================
 * Central registry of all data structures with metadata,
 * categorization, and benchmark configuration.
 */

export const DS_CATEGORIES = {
  trees: {
    label: 'Trees & Search Structures',
    icon: '🌳',
    color: '#6366f1',
    description: 'Self-balancing trees and advanced search structures',
  },
  heaps: {
    label: 'Priority Queues & Heaps',
    icon: '⛰️',
    color: '#ec4899',
    description: 'Heap-based priority queue implementations',
  },
  strings: {
    label: 'String Data Structures',
    icon: '🔤',
    color: '#10b981',
    description: 'Structures optimized for string operations',
  },
  randomized: {
    label: 'Randomized Structures',
    icon: '🎲',
    color: '#f59e0b',
    description: 'Probabilistic and randomized data structures',
  },
}

/**
 * Each DS entry defines:
 * - id: unique key
 * - name: display name
 * - category: one of DS_CATEGORIES keys
 * - description: short description
 * - complexity: { insert, search, delete } with avg/worst
 * - benchmarkOps: which operations this DS supports for benchmarking
 * - color: chart color
 */
export const DS_REGISTRY = {
  // === UNIT 1: Trees ===
  avl: {
    id: 'avl',
    name: 'AVL Tree',
    category: 'trees',
    description: 'Strictly height-balanced BST with O(log n) guarantee',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(log n)', worst: 'O(log n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#6366f1',
  },
  rbt: {
    id: 'rbt',
    name: 'Red-Black Tree',
    category: 'trees',
    description: 'Relaxed-balance BST with fewer rotations on mutation',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(log n)', worst: 'O(log n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#ef4444',
  },
  splay: {
    id: 'splay',
    name: 'Splay Tree',
    category: 'trees',
    description: 'Self-adjusting BST, amortized O(log n), great for locality',
    complexity: {
      insert: { avg: 'O(log n)*', worst: 'O(n)' },
      search: { avg: 'O(log n)*', worst: 'O(n)' },
      delete: { avg: 'O(log n)*', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#f59e0b',
  },
  threaded_bst: {
    id: 'threaded_bst',
    name: 'Threaded Binary Tree',
    category: 'trees',
    description: 'BST with thread pointers for efficient in-order traversal',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(n)' },
      search: { avg: 'O(log n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#14b8a6',
  },
  btree: {
    id: 'btree',
    name: 'B-Tree',
    category: 'trees',
    description: 'Multi-way balanced tree, optimal for disk-based storage',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(log n)', worst: 'O(log n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#0ea5e9',
  },
  bplus_tree: {
    id: 'bplus_tree',
    name: 'B+ Tree',
    category: 'trees',
    description: 'B-Tree variant with all values in leaves, linked for range queries',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(log n)', worst: 'O(log n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#0284c7',
  },


  // === UNIT 2: Priority Queues & Heaps ===
  min_heap: {
    id: 'min_heap',
    name: 'Min Heap',
    category: 'heaps',
    description: 'Binary heap with minimum element at root',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#ec4899',
  },
  max_heap: {
    id: 'max_heap',
    name: 'Max Heap',
    category: 'heaps',
    description: 'Binary heap with maximum element at root',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#f43f5e',
  },
  fibonacci_heap: {
    id: 'fibonacci_heap',
    name: 'Fibonacci Heap',
    category: 'heaps',
    description: 'Amortized O(1) insert and decrease-key, optimal for Dijkstra',
    complexity: {
      insert: { avg: 'O(1)*', worst: 'O(1)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)*', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#fb7185',
  },
  binomial_heap: {
    id: 'binomial_heap',
    name: 'Binomial Heap',
    category: 'heaps',
    description: 'Mergeable heap using collection of binomial trees',
    complexity: {
      insert: { avg: 'O(1)*', worst: 'O(log n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#e879f9',
  },
  leftist_tree: {
    id: 'leftist_tree',
    name: 'Leftist Tree',
    category: 'heaps',
    description: 'Heap-ordered tree biased to the left for efficient merge',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#f0abfc',
  },
  skew_heap: {
    id: 'skew_heap',
    name: 'Skew Heap',
    category: 'heaps',
    description: 'Self-adjusting leftist heap, simpler with amortized bounds',
    complexity: {
      insert: { avg: 'O(log n)*', worst: 'O(n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)*', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#c084fc',
  },
  pairing_heap: {
    id: 'pairing_heap',
    name: 'Pairing Heap',
    category: 'heaps',
    description: 'Simple heap with excellent practical performance',
    complexity: {
      insert: { avg: 'O(1)', worst: 'O(1)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)*', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#a78bfa',
  },
  depq: {
    id: 'depq',
    name: 'Double-Ended Priority Queue',
    category: 'heaps',
    description: 'Supports both extractMin and extractMax efficiently',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(log n)' },
      search: { avg: 'O(n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#818cf8',
  },

  // === UNIT 3: String Data Structures ===
  trie: {
    id: 'trie',
    name: 'Trie',
    category: 'strings',
    description: 'Prefix tree for efficient string retrieval',
    complexity: {
      insert: { avg: 'O(m)', worst: 'O(m)' },
      search: { avg: 'O(m)', worst: 'O(m)' },
      delete: { avg: 'O(m)', worst: 'O(m)' },
      space: 'O(ALPHABET × m × n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#10b981',
  },
  compressed_trie: {
    id: 'compressed_trie',
    name: 'Compressed Trie (Patricia)',
    category: 'strings',
    description: 'Space-optimized trie merging single-child nodes',
    complexity: {
      insert: { avg: 'O(m)', worst: 'O(m)' },
      search: { avg: 'O(m)', worst: 'O(m)' },
      delete: { avg: 'O(m)', worst: 'O(m)' },
      space: 'O(n × m)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#34d399',
  },
  dawg: {
    id: 'dawg',
    name: 'DAWG',
    category: 'strings',
    description: 'Directed Acyclic Word Graph — minimal finite automaton for strings',
    complexity: {
      insert: { avg: 'O(m)', worst: 'O(m)' },
      search: { avg: 'O(m)', worst: 'O(m)' },
      delete: { avg: 'N/A', worst: 'N/A' },
      space: 'O(n × m)',
    },
    benchmarkOps: ['insert', 'search'],
    color: '#059669',
  },
  suffix_tree: {
    id: 'suffix_tree',
    name: 'Suffix Tree',
    category: 'strings',
    description: 'All suffixes of a string in a compressed trie, O(m) pattern search',
    complexity: {
      insert: { avg: 'O(n)', worst: 'O(n)' },
      search: { avg: 'O(m)', worst: 'O(m)' },
      delete: { avg: 'N/A', worst: 'N/A' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search'],
    color: '#047857',
  },
  suffix_array: {
    id: 'suffix_array',
    name: 'Suffix Array',
    category: 'strings',
    description: 'Sorted array of all suffixes — space-efficient alternative to Suffix Tree',
    complexity: {
      insert: { avg: 'O(n log n)', worst: 'O(n log² n)' },
      search: { avg: 'O(m log n)', worst: 'O(m log n)' },
      delete: { avg: 'N/A', worst: 'N/A' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search'],
    color: '#065f46',
  },
  position_heap: {
    id: 'position_heap',
    name: 'Position Heap',
    category: 'strings',
    description: 'Heap-ordered trie for string matching positions',
    complexity: {
      insert: { avg: 'O(n)', worst: 'O(n²)' },
      search: { avg: 'O(m + occ)', worst: 'O(m × n)' },
      delete: { avg: 'N/A', worst: 'N/A' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search'],
    color: '#0d9488',
  },

  // === UNIT 4: Randomized Structures ===
  skip_list: {
    id: 'skip_list',
    name: 'Skip List',
    category: 'randomized',
    description: 'Probabilistic multi-level linked list, expected O(log n)',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(n)' },
      search: { avg: 'O(log n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(n)' },
      space: 'O(n log n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#f59e0b',
  },
  treap: {
    id: 'treap',
    name: 'Treap',
    category: 'randomized',
    description: 'BST + Heap hybrid using random priorities for balance',
    complexity: {
      insert: { avg: 'O(log n)', worst: 'O(n)' },
      search: { avg: 'O(log n)', worst: 'O(n)' },
      delete: { avg: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    benchmarkOps: ['insert', 'search', 'delete'],
    color: '#d97706',
  },
}

/** Get all DS entries as an array */
export function getAllDS() {
  return Object.values(DS_REGISTRY)
}

/** Get DS entries by category */
export function getDSByCategory(category) {
  return Object.values(DS_REGISTRY).filter(ds => ds.category === category)
}

/** Get DS entry by id */
export function getDS(id) {
  return DS_REGISTRY[id]
}

/** Get all category keys */
export function getCategoryKeys() {
  return Object.keys(DS_CATEGORIES)
}

/** Get the grouped structure: { category: [ds entries] } */
export function getDSGrouped() {
  const groups = {}
  for (const [catKey, catMeta] of Object.entries(DS_CATEGORIES)) {
    groups[catKey] = {
      ...catMeta,
      structures: getDSByCategory(catKey),
    }
  }
  return groups
}
