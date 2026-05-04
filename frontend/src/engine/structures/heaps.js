/**
 * Neuro-DS v2.0 — Heap & Priority Queue Implementations
 * =======================================================
 * Min Heap, Max Heap, Fibonacci Heap, Binomial Heap,
 * Leftist Tree, Skew Heap, Pairing Heap, DEPQ
 */

// ─────────────────────────────────────────────
// 1. MIN HEAP (Binary)
// ─────────────────────────────────────────────
export class MinHeap {
  constructor() { this.data = [] }

  insert(k) { this.data.push(k); this._up(this.data.length - 1) }

  search(k) { return this.data.includes(k) }

  delete(k) {
    const i = this.data.indexOf(k)
    if (i === -1) return
    this.data[i] = this.data[this.data.length - 1]
    this.data.pop()
    if (i < this.data.length) { this._up(i); this._down(i) }
  }

  _up(i) { while (i > 0) { const p = (i - 1) >> 1; if (this.data[p] <= this.data[i]) break; [this.data[p], this.data[i]] = [this.data[i], this.data[p]]; i = p } }
  _down(i) {
    const n = this.data.length
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2
      if (l < n && this.data[l] < this.data[s]) s = l
      if (r < n && this.data[r] < this.data[s]) s = r
      if (s === i) break;
      [this.data[i], this.data[s]] = [this.data[s], this.data[i]]; i = s
    }
  }
}

// ─────────────────────────────────────────────
// 2. MAX HEAP (Binary)
// ─────────────────────────────────────────────
export class MaxHeap {
  constructor() { this.data = [] }

  insert(k) { this.data.push(k); this._up(this.data.length - 1) }

  search(k) { return this.data.includes(k) }

  delete(k) {
    const i = this.data.indexOf(k)
    if (i === -1) return
    this.data[i] = this.data[this.data.length - 1]
    this.data.pop()
    if (i < this.data.length) { this._up(i); this._down(i) }
  }

  _up(i) { while (i > 0) { const p = (i - 1) >> 1; if (this.data[p] >= this.data[i]) break; [this.data[p], this.data[i]] = [this.data[i], this.data[p]]; i = p } }
  _down(i) {
    const n = this.data.length
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2
      if (l < n && this.data[l] > this.data[s]) s = l
      if (r < n && this.data[r] > this.data[s]) s = r
      if (s === i) break;
      [this.data[i], this.data[s]] = [this.data[s], this.data[i]]; i = s
    }
  }
}

// ─────────────────────────────────────────────
// 3. FIBONACCI HEAP
// ─────────────────────────────────────────────
export class FibonacciHeap {
  constructor() { this.min = null; this.n = 0; this._roots = [] }

  insert(k) {
    const node = { k, degree: 0, child: null, left: null, right: null, parent: null, mark: false }
    node.left = node; node.right = node
    if (this.min === null) { this.min = node; this._roots = [node] }
    else { this._roots.push(node); if (k < this.min.k) this.min = node }
    this.n++
  }

  search(k) {
    for (const r of this._roots) { if (this._searchNode(r, k)) return true }
    return false
  }

  _searchNode(n, k) {
    if (!n) return false
    if (n.k === k) return true
    let c = n.child, start = c
    if (c) {
      do { if (this._searchNode(c, k)) return true; c = c.right } while (c !== start)
    }
    return false
  }

  delete(k) {
    // Simplified: rebuild without the key
    const allKeys = []
    for (const r of this._roots) this._collect(r, allKeys)
    this.min = null; this.n = 0; this._roots = []
    for (const key of allKeys) { if (key !== k) this.insert(key) }
  }

  _collect(n, arr) {
    if (!n) return
    arr.push(n.k)
    let c = n.child, start = c
    if (c) { do { this._collect(c, arr); c = c.right } while (c !== start) }
  }
}

// ─────────────────────────────────────────────
// 4. BINOMIAL HEAP
// ─────────────────────────────────────────────
export class BinomialHeap {
  constructor() { this.trees = []; this.n = 0 }

  insert(k) {
    const single = [{ k, degree: 0, children: [] }]
    this.trees = this._merge(this.trees, single)
    this.n++
  }

  search(k) {
    for (const t of this.trees) { if (this._searchTree(t, k)) return true }
    return false
  }

  _searchTree(n, k) {
    if (n.k === k) return true
    for (const c of n.children) { if (this._searchTree(c, k)) return true }
    return false
  }

  delete(k) {
    const allKeys = []
    for (const t of this.trees) this._collectKeys(t, allKeys)
    this.trees = []; this.n = 0
    for (const key of allKeys) { if (key !== k) this.insert(key) }
  }

  _collectKeys(n, arr) {
    arr.push(n.k)
    for (const c of n.children) this._collectKeys(c, arr)
  }

  _merge(h1, h2) {
    const combined = [...h1, ...h2].sort((a, b) => a.degree - b.degree)
    const result = []
    for (const tree of combined) {
      while (result.length > 0 && result[result.length - 1].degree === tree.degree) {
        const prev = result.pop()
        if (prev.k <= tree.k) { prev.children.push(tree); prev.degree++; result.push(prev); break }
        else { tree.children.push(prev); tree.degree++ }
      }
      if (result.length === 0 || result[result.length - 1].degree !== tree.degree) result.push(tree)
    }
    return result
  }
}

// ─────────────────────────────────────────────
// 5. LEFTIST TREE
// ─────────────────────────────────────────────
export class LeftistTree {
  constructor() { this.root = null }

  _rank(n) { return n ? n.rank : 0 }

  _merge(a, b) {
    if (!a) return b
    if (!b) return a
    if (a.k > b.k) [a, b] = [b, a]
    a.r = this._merge(a.r, b)
    if (this._rank(a.l) < this._rank(a.r)) [a.l, a.r] = [a.r, a.l]
    a.rank = this._rank(a.r) + 1
    return a
  }

  insert(k) { this.root = this._merge(this.root, { k, l: null, r: null, rank: 1 }) }

  search(k) { return this._search(this.root, k) }
  _search(n, k) {
    if (!n) return false
    if (n.k === k) return true
    return this._search(n.l, k) || this._search(n.r, k)
  }

  delete(k) {
    this.root = this._delNode(this.root, k)
  }
  _delNode(n, k) {
    if (!n) return null
    if (n.k === k) return this._merge(n.l, n.r)
    n.l = this._delNode(n.l, k)
    n.r = this._delNode(n.r, k)
    if (this._rank(n.l) < this._rank(n.r)) [n.l, n.r] = [n.r, n.l]
    n.rank = this._rank(n.r) + 1
    return n
  }
}

// ─────────────────────────────────────────────
// 6. SKEW HEAP
// ─────────────────────────────────────────────
export class SkewHeap {
  constructor() { this.root = null }

  _merge(a, b) {
    if (!a) return b
    if (!b) return a
    if (a.k > b.k) [a, b] = [b, a]
    const tmp = a.l
    a.l = this._merge(a.r, b)
    a.r = tmp
    return a
  }

  insert(k) { this.root = this._merge(this.root, { k, l: null, r: null }) }

  search(k) { return this._search(this.root, k) }
  _search(n, k) {
    if (!n) return false
    if (n.k === k) return true
    return this._search(n.l, k) || this._search(n.r, k)
  }

  delete(k) { this.root = this._delNode(this.root, k) }
  _delNode(n, k) {
    if (!n) return null
    if (n.k === k) return this._merge(n.l, n.r)
    n.l = this._delNode(n.l, k)
    n.r = this._delNode(n.r, k)
    return n
  }
}

// ─────────────────────────────────────────────
// 7. PAIRING HEAP
// ─────────────────────────────────────────────
export class PairingHeap {
  constructor() { this.root = null }

  _merge(a, b) {
    if (!a) return b
    if (!b) return a
    if (a.k > b.k) [a, b] = [b, a]
    b.next = a.child
    a.child = b
    return a
  }

  insert(k) { this.root = this._merge(this.root, { k, child: null, next: null }) }

  search(k) { return this._search(this.root, k) }
  _search(n, k) {
    if (!n) return false
    if (n.k === k) return true
    return this._search(n.child, k) || this._search(n.next, k)
  }

  delete(k) {
    if (!this.root) return
    if (this.root.k === k) {
      this.root = this._mergePairs(this.root.child)
      return
    }
    this._delChild(this.root, k)
  }

  _delChild(n, k) {
    if (!n) return
    let c = n.child, prev = null
    while (c) {
      if (c.k === k) {
        const merged = this._mergePairs(c.child)
        if (prev) prev.next = c.next
        else n.child = c.next
        this.root = this._merge(this.root, merged)
        return
      }
      this._delChild(c, k)
      prev = c
      c = c.next
    }
  }

  _mergePairs(n) {
    if (!n) return null
    if (!n.next) return n
    const a = n, b = n.next, rest = n.next.next
    a.next = null; b.next = null
    return this._merge(this._merge(a, b), this._mergePairs(rest))
  }
}

// ─────────────────────────────────────────────
// 8. DOUBLE-ENDED PRIORITY QUEUE (Min-Max Heap)
// ─────────────────────────────────────────────
export class DEPQ {
  constructor() { this.minH = new MinHeap(); this.maxH = new MaxHeap() }

  insert(k) { this.minH.insert(k); this.maxH.insert(k) }

  search(k) { return this.minH.search(k) }

  delete(k) { this.minH.delete(k); this.maxH.delete(k) }
}
