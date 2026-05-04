/**
 * Neuro-DS v2.0 — String Data Structure Implementations
 * ======================================================
 * Trie, Compressed Trie (Patricia), DAWG, Suffix Tree, Suffix Array, Position Heap
 * 
 * Note: String DS use string keys. The benchmark runner generates random strings
 * for benchmarking. insert(word), search(word), delete(word)
 */

// ─────────────────────────────────────────────
// 1. TRIE
// ─────────────────────────────────────────────
export class Trie {
  constructor() { this.root = { children: {}, end: false } }

  insert(word) {
    let n = this.root
    for (const ch of String(word)) {
      if (!n.children[ch]) n.children[ch] = { children: {}, end: false }
      n = n.children[ch]
    }
    n.end = true
  }

  search(word) {
    let n = this.root
    for (const ch of String(word)) {
      if (!n.children[ch]) return false
      n = n.children[ch]
    }
    return n.end
  }

  delete(word) {
    this._del(this.root, String(word), 0)
  }

  _del(n, word, i) {
    if (i === word.length) { n.end = false; return Object.keys(n.children).length === 0 }
    const ch = word[i]
    if (!n.children[ch]) return false
    const shouldDel = this._del(n.children[ch], word, i + 1)
    if (shouldDel) { delete n.children[ch]; return !n.end && Object.keys(n.children).length === 0 }
    return false
  }
}

// ─────────────────────────────────────────────
// 2. COMPRESSED TRIE (Patricia Trie)
// ─────────────────────────────────────────────
export class CompressedTrie {
  constructor() { this.root = { label: '', children: {}, end: false } }

  insert(word) {
    word = String(word)
    this._ins(this.root, word)
  }

  _ins(node, word) {
    if (word.length === 0) { node.end = true; return }
    const ch = word[0]
    if (!node.children[ch]) {
      node.children[ch] = { label: word, children: {}, end: true }
      return
    }
    const child = node.children[ch]
    const label = child.label
    let i = 0
    while (i < label.length && i < word.length && label[i] === word[i]) i++

    if (i === label.length) {
      this._ins(child, word.slice(i))
    } else {
      // Split
      const newChild = { label: label.slice(0, i), children: {}, end: i === word.length }
      const oldPart = { ...child, label: label.slice(i) }
      newChild.children[label[i]] = oldPart
      if (i < word.length) {
        newChild.children[word[i]] = { label: word.slice(i), children: {}, end: true }
      }
      node.children[ch] = newChild
    }
  }

  search(word) {
    word = String(word)
    return this._search(this.root, word)
  }

  _search(node, word) {
    if (word.length === 0) return node.end
    const ch = word[0]
    if (!node.children[ch]) return false
    const child = node.children[ch]
    if (word.startsWith(child.label)) return this._search(child, word.slice(child.label.length))
    return false
  }

  delete(word) {
    word = String(word)
    this._del(this.root, word)
  }

  _del(node, word) {
    if (word.length === 0) { node.end = false; return }
    const ch = word[0]
    if (!node.children[ch]) return
    const child = node.children[ch]
    if (word.startsWith(child.label)) {
      this._del(child, word.slice(child.label.length))
      if (!child.end && Object.keys(child.children).length === 0) delete node.children[ch]
    }
  }
}

// ─────────────────────────────────────────────
// 3. DAWG (Directed Acyclic Word Graph)
// ─────────────────────────────────────────────
export class DAWG {
  constructor() {
    this.nextId = 0
    this.root = this._createState()
    this.words = new Set()
  }

  _createState() { return { id: this.nextId++, transitions: {}, isFinal: false, suffix: null } }

  insert(word) {
    word = String(word)
    this.words.add(word)
    // Simplified DAWG: trie-like insertion (full DAWG construction is very complex)
    let node = this.root
    for (const ch of word) {
      if (!node.transitions[ch]) node.transitions[ch] = this._createState()
      node = node.transitions[ch]
    }
    node.isFinal = true
  }

  search(word) {
    word = String(word)
    let node = this.root
    for (const ch of word) {
      if (!node.transitions[ch]) return false
      node = node.transitions[ch]
    }
    return node.isFinal
  }

  delete(word) {
    word = String(word)
    this.words.delete(word)
    // Mark as not final
    let node = this.root
    for (const ch of word) {
      if (!node.transitions[ch]) return
      node = node.transitions[ch]
    }
    node.isFinal = false
  }
}

// ─────────────────────────────────────────────
// 4. SUFFIX TREE (Simplified — built for a single text)
// ─────────────────────────────────────────────
export class SuffixTree {
  constructor() { this.text = ''; this.root = { children: {} } }

  insert(word) {
    // Build suffix tree for the word
    word = String(word) + '$'
    this.text = word
    this.root = { children: {} }
    for (let i = 0; i < word.length; i++) {
      this._insertSuffix(word.slice(i), i)
    }
  }

  _insertSuffix(suffix, idx) {
    let node = this.root
    for (const ch of suffix) {
      if (!node.children[ch]) node.children[ch] = { children: {}, indices: [] }
      node = node.children[ch]
    }
    node.indices = node.indices || []
    node.indices.push(idx)
  }

  search(pattern) {
    pattern = String(pattern)
    let node = this.root
    for (const ch of pattern) {
      if (!node.children[ch]) return false
      node = node.children[ch]
    }
    return true
  }

  delete() {
    // Suffix trees don't support individual deletion; reset
    this.text = ''
    this.root = { children: {} }
  }
}

// ─────────────────────────────────────────────
// 5. SUFFIX ARRAY
// ─────────────────────────────────────────────
export class SuffixArray {
  constructor() { this.text = ''; this.sa = [] }

  insert(word) {
    word = String(word)
    this.text = word
    // Build suffix array: sorted indices of all suffixes
    this.sa = Array.from({ length: word.length }, (_, i) => i)
    this.sa.sort((a, b) => {
      const sa = word.slice(a), sb = word.slice(b)
      return sa < sb ? -1 : sa > sb ? 1 : 0
    })
  }

  search(pattern) {
    pattern = String(pattern)
    // Binary search on suffix array
    let lo = 0, hi = this.sa.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const suffix = this.text.slice(this.sa[mid], this.sa[mid] + pattern.length)
      if (suffix === pattern) return true
      if (suffix < pattern) lo = mid + 1
      else hi = mid - 1
    }
    return false
  }

  delete() {
    this.text = ''
    this.sa = []
  }
}

// ─────────────────────────────────────────────
// 6. POSITION HEAP
// ─────────────────────────────────────────────
export class PositionHeap {
  constructor() { this.root = { children: {}, position: -1 }; this.text = '' }

  insert(word) {
    word = String(word)
    this.text = word
    // Build position heap: insert positions based on suffixes
    for (let i = 0; i < word.length; i++) {
      this._insertPosition(word, i)
    }
  }

  _insertPosition(text, pos) {
    let node = this.root
    for (let i = pos; i < text.length; i++) {
      const ch = text[i]
      if (!node.children[ch]) {
        node.children[ch] = { children: {}, position: pos }
        return
      }
      node = node.children[ch]
    }
  }

  search(pattern) {
    pattern = String(pattern)
    let node = this.root
    for (const ch of pattern) {
      if (!node.children[ch]) return false
      node = node.children[ch]
    }
    return true
  }

  delete() {
    this.root = { children: {}, position: -1 }
    this.text = ''
  }
}
