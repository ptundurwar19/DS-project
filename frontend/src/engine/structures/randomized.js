/**
 * Neuro-DS v2.0 — Randomized Data Structure Implementations
 * ===========================================================
 * Skip List, Treap
 */

// ─────────────────────────────────────────────
// 1. SKIP LIST
// ─────────────────────────────────────────────
export class SkipList {
  constructor() {
    this.MAX_LEVEL = 16
    this.level = 0
    this.header = this._createNode(-Infinity, this.MAX_LEVEL)
  }

  _createNode(k, level) {
    return { k, forward: new Array(level + 1).fill(null) }
  }

  _randomLevel() {
    let lvl = 0
    while (lvl < this.MAX_LEVEL && Math.random() < 0.5) lvl++
    return lvl
  }

  insert(k) {
    const update = new Array(this.MAX_LEVEL + 1).fill(null)
    let curr = this.header
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].k < k) curr = curr.forward[i]
      update[i] = curr
    }
    curr = curr.forward[0]
    if (curr && curr.k === k) return

    const newLevel = this._randomLevel()
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) update[i] = this.header
      this.level = newLevel
    }
    const node = this._createNode(k, newLevel)
    for (let i = 0; i <= newLevel; i++) {
      node.forward[i] = update[i].forward[i]
      update[i].forward[i] = node
    }
  }

  search(k) {
    let curr = this.header
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].k < k) curr = curr.forward[i]
    }
    curr = curr.forward[0]
    return curr !== null && curr.k === k
  }

  delete(k) {
    const update = new Array(this.MAX_LEVEL + 1).fill(null)
    let curr = this.header
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].k < k) curr = curr.forward[i]
      update[i] = curr
    }
    curr = curr.forward[0]
    if (!curr || curr.k !== k) return
    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== curr) break
      update[i].forward[i] = curr.forward[i]
    }
    while (this.level > 0 && !this.header.forward[this.level]) this.level--
  }
}

// ─────────────────────────────────────────────
// 2. TREAP
// ─────────────────────────────────────────────
export class Treap {
  constructor() { this.root = null }

  _rotR(n) { const l = n.l; n.l = l.r; l.r = n; return l }
  _rotL(n) { const r = n.r; n.r = r.l; r.l = n; return r }

  _ins(n, k) {
    if (!n) return { k, pri: Math.random(), l: null, r: null }
    if (k < n.k) { n.l = this._ins(n.l, k); if (n.l.pri > n.pri) n = this._rotR(n) }
    else if (k > n.k) { n.r = this._ins(n.r, k); if (n.r.pri > n.pri) n = this._rotL(n) }
    return n
  }

  _del(n, k) {
    if (!n) return null
    if (k < n.k) n.l = this._del(n.l, k)
    else if (k > n.k) n.r = this._del(n.r, k)
    else {
      if (!n.l) return n.r
      if (!n.r) return n.l
      if (n.l.pri > n.r.pri) { n = this._rotR(n); n.r = this._del(n.r, k) }
      else { n = this._rotL(n); n.l = this._del(n.l, k) }
    }
    return n
  }

  insert(k) { this.root = this._ins(this.root, k) }

  search(k) {
    let n = this.root
    while (n) { if (k === n.k) return true; n = k < n.k ? n.l : n.r }
    return false
  }

  delete(k) { this.root = this._del(this.root, k) }
}
