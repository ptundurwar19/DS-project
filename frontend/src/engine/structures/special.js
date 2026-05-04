/**
 * Neuro-DS v2.0 — Special Data Structure Implementations
 * ========================================================
 * Van Emde Boas Tree, Huffman Tree, Fusion Tree (simplified),
 * Dynamic Finger Search Tree (simplified)
 */

// ─────────────────────────────────────────────
// 1. VAN EMDE BOAS TREE (Universe size = 2^16 = 65536)
// ─────────────────────────────────────────────
export class VEBTree {
  constructor(u = 65536) {
    this.u = u
    if (u <= 2) {
      this.min = -1; this.max = -1
    } else {
      this.min = -1; this.max = -1
      this.sqrtU = Math.ceil(Math.sqrt(u))
      this.clusters = new Array(this.sqrtU).fill(null)
      this.summary = null
    }
  }

  _high(x) { return Math.floor(x / this.sqrtU) }
  _low(x) { return x % this.sqrtU }
  _index(h, l) { return h * this.sqrtU + l }

  _getCluster(i) {
    if (!this.clusters[i]) this.clusters[i] = new VEBTree(this.sqrtU)
    return this.clusters[i]
  }
  _getSummary() {
    if (!this.summary) this.summary = new VEBTree(this.sqrtU)
    return this.summary
  }

  insert(x) {
    x = Math.abs(x) % this.u
    if (this.min === -1) { this.min = x; this.max = x; return }
    if (x < this.min) { const tmp = x; x = this.min; this.min = tmp }
    if (this.u > 2) {
      const h = this._high(x), l = this._low(x)
      const cl = this._getCluster(h)
      if (cl.min === -1) this._getSummary().insert(h)
      cl.insert(l)
    }
    if (x > this.max) this.max = x
  }

  search(x) {
    x = Math.abs(x) % this.u
    if (x === this.min || x === this.max) return true
    if (this.u <= 2) return false
    const h = this._high(x), l = this._low(x)
    if (!this.clusters[h]) return false
    return this.clusters[h].search(l)
  }

  delete(x) {
    x = Math.abs(x) % this.u
    if (this.min === this.max) { this.min = -1; this.max = -1; return }
    if (this.u <= 2) {
      this.min = x === 0 ? 1 : 0
      this.max = this.min
      return
    }
    if (x === this.min) {
      const firstCluster = this.summary ? this.summary.min : -1
      if (firstCluster === -1) return
      x = this._index(firstCluster, this._getCluster(firstCluster).min)
      this.min = x
    }
    const h = this._high(x), l = this._low(x)
    if (this.clusters[h]) {
      this.clusters[h].delete(l)
      if (this.clusters[h].min === -1) {
        if (this.summary) this.summary.delete(h)
      }
    }
    if (x === this.max) {
      if (!this.summary || this.summary.max === -1) { this.max = this.min }
      else {
        const maxCluster = this.summary.max
        this.max = this._index(maxCluster, this._getCluster(maxCluster).max)
      }
    }
  }
}

// ─────────────────────────────────────────────
// 2. HUFFMAN TREE
// ─────────────────────────────────────────────
export class HuffmanTree {
  constructor() { this.root = null; this.codes = {}; this.freq = {} }

  insert(k) {
    // Build frequency map, rebuild tree
    const s = String(k)
    for (const ch of s) this.freq[ch] = (this.freq[ch] || 0) + 1
    this._build()
  }

  _build() {
    const entries = Object.entries(this.freq).map(([ch, f]) => ({ ch, f, l: null, r: null }))
    if (entries.length === 0) { this.root = null; return }
    if (entries.length === 1) { this.root = entries[0]; this.codes[entries[0].ch] = '0'; return }

    // Simple priority queue using sorted array
    entries.sort((a, b) => a.f - b.f)
    const pq = [...entries]

    while (pq.length > 1) {
      pq.sort((a, b) => a.f - b.f)
      const left = pq.shift()
      const right = pq.shift()
      pq.push({ ch: null, f: left.f + right.f, l: left, r: right })
    }

    this.root = pq[0]
    this.codes = {}
    this._buildCodes(this.root, '')
  }

  _buildCodes(n, prefix) {
    if (!n) return
    if (n.ch !== null) { this.codes[n.ch] = prefix || '0'; return }
    this._buildCodes(n.l, prefix + '0')
    this._buildCodes(n.r, prefix + '1')
  }

  search(k) {
    // Check if any character in k has a code
    const s = String(k)
    for (const ch of s) { if (this.codes[ch]) return true }
    return false
  }

  delete(k) {
    const s = String(k)
    for (const ch of s) {
      if (this.freq[ch]) {
        this.freq[ch]--
        if (this.freq[ch] <= 0) delete this.freq[ch]
      }
    }
    this._build()
  }
}

// ─────────────────────────────────────────────
// 3. FUSION TREE (Simplified — uses sorted array with binary search)
// Note: True Fusion Trees use word-level parallelism (impossible in JS).
// This is a simplified version demonstrating the concept.
// ─────────────────────────────────────────────
export class FusionTree {
  constructor() { this.data = [] }

  insert(k) {
    // Binary search to find insertion point
    let lo = 0, hi = this.data.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.data[mid] < k) lo = mid + 1; else hi = mid }
    if (lo < this.data.length && this.data[lo] === k) return
    this.data.splice(lo, 0, k)
  }

  search(k) {
    let lo = 0, hi = this.data.length - 1
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (this.data[mid] === k) return true; if (this.data[mid] < k) lo = mid + 1; else hi = mid - 1 }
    return false
  }

  delete(k) {
    let lo = 0, hi = this.data.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (this.data[mid] === k) { this.data.splice(mid, 1); return }
      if (this.data[mid] < k) lo = mid + 1; else hi = mid - 1
    }
  }
}

// ─────────────────────────────────────────────
// 4. DYNAMIC FINGER SEARCH TREE
// Simplified: BST with a "finger" pointer that speeds up
// searches near the last accessed element.
// ─────────────────────────────────────────────
export class FingerSearchTree {
  constructor() { this.root = null; this.finger = null }

  _ins(n, k) {
    if (!n) return { k, l: null, r: null, p: null }
    if (k < n.k) { n.l = this._ins(n.l, k); if (n.l) n.l.p = n }
    else if (k > n.k) { n.r = this._ins(n.r, k); if (n.r) n.r.p = n }
    return n
  }

  insert(k) {
    this.root = this._ins(this.root, k)
    if (this.root) this.root.p = null
  }

  search(k) {
    // Start from finger if available and closer
    let start = this.root
    if (this.finger) {
      // Walk up from finger to find a good starting point
      let n = this.finger
      while (n.p && ((k < n.k && n.p.k < n.k && k < n.p.k) || (k > n.k && n.p.k > n.k && k > n.p.k))) {
        n = n.p
      }
      start = n
    }

    // Search from start
    let n = start
    // First try going up if needed
    while (n && n.p && ((k < n.k && !n.l) || (k > n.k && !n.r))) {
      n = n.p
    }
    // Then search down
    while (n) {
      if (k === n.k) { this.finger = n; return true }
      n = k < n.k ? n.l : n.r
    }

    // Fallback: standard search from root
    n = this.root
    while (n) {
      if (k === n.k) { this.finger = n; return true }
      n = k < n.k ? n.l : n.r
    }
    return false
  }

  _minNode(n) { while (n.l) n = n.l; return n }

  delete(k) {
    this.root = this._del(this.root, k)
    if (this.root) this.root.p = null
    if (this.finger && this.finger.k === k) this.finger = this.root
  }

  _del(n, k) {
    if (!n) return null
    if (k < n.k) { n.l = this._del(n.l, k); if (n.l) n.l.p = n }
    else if (k > n.k) { n.r = this._del(n.r, k); if (n.r) n.r.p = n }
    else {
      if (!n.l) return n.r
      if (!n.r) return n.l
      const s = this._minNode(n.r)
      n.k = s.k
      n.r = this._del(n.r, s.k)
      if (n.r) n.r.p = n
    }
    return n
  }
}
