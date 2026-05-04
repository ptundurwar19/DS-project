/**
 * Neuro-DS v2.0 — Tree Data Structure Implementations
 * =====================================================
 * AVL Tree, Red-Black Tree, Splay Tree, Threaded BST, B-Tree, B+ Tree
 * Each exports a class with: insert(key), search(key), delete(key)
 */

// ─────────────────────────────────────────────
// 1. AVL TREE
// ─────────────────────────────────────────────
export class AVLTree {
  constructor() { this.root = null }

  _height(n) { return n ? n.h : 0 }
  _bf(n) { return n ? this._height(n.l) - this._height(n.r) : 0 }
  _upH(n) { if (n) n.h = 1 + Math.max(this._height(n.l), this._height(n.r)) }

  _rotR(y) { const x = y.l, t = x.r; x.r = y; y.l = t; this._upH(y); this._upH(x); return x }
  _rotL(x) { const y = x.r, t = y.l; y.l = x; x.r = t; this._upH(x); this._upH(y); return y }

  _ins(n, k) {
    if (!n) return { k, l: null, r: null, h: 1 }
    if (k < n.k) n.l = this._ins(n.l, k)
    else if (k > n.k) n.r = this._ins(n.r, k)
    else return n
    this._upH(n)
    const b = this._bf(n)
    if (b > 1 && k < n.l.k) return this._rotR(n)
    if (b < -1 && k > n.r.k) return this._rotL(n)
    if (b > 1 && k > n.l.k) { n.l = this._rotL(n.l); return this._rotR(n) }
    if (b < -1 && k < n.r.k) { n.r = this._rotR(n.r); return this._rotL(n) }
    return n
  }

  _minNode(n) { while (n.l) n = n.l; return n }

  _del(n, k) {
    if (!n) return null
    if (k < n.k) n.l = this._del(n.l, k)
    else if (k > n.k) n.r = this._del(n.r, k)
    else {
      if (!n.l) return n.r
      if (!n.r) return n.l
      const s = this._minNode(n.r)
      n.k = s.k
      n.r = this._del(n.r, s.k)
    }
    this._upH(n)
    const b = this._bf(n)
    if (b > 1 && this._bf(n.l) >= 0) return this._rotR(n)
    if (b > 1 && this._bf(n.l) < 0) { n.l = this._rotL(n.l); return this._rotR(n) }
    if (b < -1 && this._bf(n.r) <= 0) return this._rotL(n)
    if (b < -1 && this._bf(n.r) > 0) { n.r = this._rotR(n.r); return this._rotL(n) }
    return n
  }

  insert(k) { this.root = this._ins(this.root, k) }
  search(k) { let n = this.root; while (n) { if (k === n.k) return true; n = k < n.k ? n.l : n.r } return false }
  delete(k) { this.root = this._del(this.root, k) }
}

// ─────────────────────────────────────────────
// 2. RED-BLACK TREE
// ─────────────────────────────────────────────
const RED = 0, BLACK = 1
export class RedBlackTree {
  constructor() { this.NIL = { k: 0, c: BLACK, l: null, r: null, p: null }; this.NIL.l = this.NIL; this.NIL.r = this.NIL; this.NIL.p = this.NIL; this.root = this.NIL }

  _rotL(x) {
    const y = x.r; x.r = y.l
    if (y.l !== this.NIL) y.l.p = x
    y.p = x.p
    if (x.p === this.NIL) this.root = y
    else if (x === x.p.l) x.p.l = y
    else x.p.r = y
    y.l = x; x.p = y
  }
  _rotR(x) {
    const y = x.l; x.l = y.r
    if (y.r !== this.NIL) y.r.p = x
    y.p = x.p
    if (x.p === this.NIL) this.root = y
    else if (x === x.p.r) x.p.r = y
    else x.p.l = y
    y.r = x; x.p = y
  }

  insert(k) {
    const z = { k, c: RED, l: this.NIL, r: this.NIL, p: this.NIL }
    let y = this.NIL, x = this.root
    while (x !== this.NIL) { y = x; if (k < x.k) x = x.l; else if (k > x.k) x = x.r; else return }
    z.p = y
    if (y === this.NIL) this.root = z
    else if (k < y.k) y.l = z
    else y.r = z
    this._insertFix(z)
  }

  _insertFix(z) {
    while (z.p.c === RED) {
      if (z.p === z.p.p.l) {
        const y = z.p.p.r
        if (y.c === RED) { z.p.c = BLACK; y.c = BLACK; z.p.p.c = RED; z = z.p.p }
        else { if (z === z.p.r) { z = z.p; this._rotL(z) } z.p.c = BLACK; z.p.p.c = RED; this._rotR(z.p.p) }
      } else {
        const y = z.p.p.l
        if (y.c === RED) { z.p.c = BLACK; y.c = BLACK; z.p.p.c = RED; z = z.p.p }
        else { if (z === z.p.l) { z = z.p; this._rotR(z) } z.p.c = BLACK; z.p.p.c = RED; this._rotL(z.p.p) }
      }
    }
    this.root.c = BLACK
  }

  search(k) { let n = this.root; while (n !== this.NIL) { if (k === n.k) return true; n = k < n.k ? n.l : n.r } return false }

  _transplant(u, v) {
    if (u.p === this.NIL) this.root = v
    else if (u === u.p.l) u.p.l = v
    else u.p.r = v
    v.p = u.p
  }
  _min(n) { while (n.l !== this.NIL) n = n.l; return n }

  delete(k) {
    let z = this.root
    while (z !== this.NIL) { if (k === z.k) break; z = k < z.k ? z.l : z.r }
    if (z === this.NIL) return
    let y = z, yOrig = y.c, x
    if (z.l === this.NIL) { x = z.r; this._transplant(z, z.r) }
    else if (z.r === this.NIL) { x = z.l; this._transplant(z, z.l) }
    else {
      y = this._min(z.r); yOrig = y.c; x = y.r
      if (y.p === z) { x.p = y }
      else { this._transplant(y, y.r); y.r = z.r; y.r.p = y }
      this._transplant(z, y); y.l = z.l; y.l.p = y; y.c = z.c
    }
    if (yOrig === BLACK) this._deleteFix(x)
  }

  _deleteFix(x) {
    while (x !== this.root && x.c === BLACK) {
      if (x === x.p.l) {
        let w = x.p.r
        if (w.c === RED) { w.c = BLACK; x.p.c = RED; this._rotL(x.p); w = x.p.r }
        if (w.l.c === BLACK && w.r.c === BLACK) { w.c = RED; x = x.p }
        else {
          if (w.r.c === BLACK) { w.l.c = BLACK; w.c = RED; this._rotR(w); w = x.p.r }
          w.c = x.p.c; x.p.c = BLACK; w.r.c = BLACK; this._rotL(x.p); x = this.root
        }
      } else {
        let w = x.p.l
        if (w.c === RED) { w.c = BLACK; x.p.c = RED; this._rotR(x.p); w = x.p.l }
        if (w.r.c === BLACK && w.l.c === BLACK) { w.c = RED; x = x.p }
        else {
          if (w.l.c === BLACK) { w.r.c = BLACK; w.c = RED; this._rotL(w); w = x.p.l }
          w.c = x.p.c; x.p.c = BLACK; w.l.c = BLACK; this._rotR(x.p); x = this.root
        }
      }
    }
    x.c = BLACK
  }
}

// ─────────────────────────────────────────────
// 3. SPLAY TREE
// ─────────────────────────────────────────────
export class SplayTree {
  constructor() { this.root = null }

  _rotR(x) { const y = x.l; x.l = y.r; if (y.r) y.r.p = x; y.p = x.p; if (!x.p) this.root = y; else if (x === x.p.r) x.p.r = y; else x.p.l = y; y.r = x; x.p = y }
  _rotL(x) { const y = x.r; x.r = y.l; if (y.l) y.l.p = x; y.p = x.p; if (!x.p) this.root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y; y.l = x; x.p = y }

  _splay(x) {
    while (x.p) {
      if (!x.p.p) { x === x.p.l ? this._rotR(x.p) : this._rotL(x.p) }
      else if (x === x.p.l && x.p === x.p.p.l) { this._rotR(x.p.p); this._rotR(x.p) }
      else if (x === x.p.r && x.p === x.p.p.r) { this._rotL(x.p.p); this._rotL(x.p) }
      else if (x === x.p.r && x.p === x.p.p.l) { this._rotL(x.p); this._rotR(x.p) }
      else { this._rotR(x.p); this._rotL(x.p) }
    }
  }

  insert(k) {
    if (!this.root) { this.root = { k, l: null, r: null, p: null }; return }
    let n = this.root, p = null
    while (n) { p = n; if (k < n.k) n = n.l; else if (k > n.k) n = n.r; else { this._splay(n); return } }
    const z = { k, l: null, r: null, p }
    if (k < p.k) p.l = z; else p.r = z
    this._splay(z)
  }

  search(k) {
    let n = this.root, last = null
    while (n) { last = n; if (k === n.k) { this._splay(n); return true } n = k < n.k ? n.l : n.r }
    if (last) this._splay(last)
    return false
  }

  delete(k) {
    if (!this.search(k)) return
    const l = this.root.l, r = this.root.r
    if (!l) { this.root = r; if (r) r.p = null; return }
    if (!r) { this.root = l; l.p = null; return }
    l.p = null; r.p = null
    let m = l; while (m.r) m = m.r
    this._splay(m)
    m.r = r; r.p = m
    this.root = m
  }
}

// ─────────────────────────────────────────────
// 4. THREADED BINARY TREE
// ─────────────────────────────────────────────
export class ThreadedBST {
  constructor() { this.root = null }

  insert(k) {
    if (!this.root) { this.root = { k, l: null, r: null, lt: true, rt: true }; return }
    let n = this.root
    while (true) {
      if (k < n.k) {
        if (n.lt) { const z = { k, l: n.l, r: n, lt: n.lt, rt: true }; n.l = z; n.lt = false; return }
        n = n.l
      } else if (k > n.k) {
        if (n.rt) { const z = { k, l: n, r: n.r, lt: true, rt: n.rt }; n.r = z; n.rt = false; return }
        n = n.r
      } else return
    }
  }

  search(k) {
    let n = this.root
    while (n) {
      if (k === n.k) return true
      if (k < n.k) { if (n.lt) return false; n = n.l }
      else { if (n.rt) return false; n = n.r }
    }
    return false
  }

  delete(k) {
    // Simplified: mark-based deletion for benchmarking purposes
    let n = this.root, p = null, isLeft = false
    while (n) {
      if (k === n.k) break
      p = n
      if (k < n.k) { if (n.lt) return; isLeft = true; n = n.l }
      else { if (n.rt) return; isLeft = false; n = n.r }
    }
    if (!n) return
    // Leaf node or single-child — simplified for benchmarking
    if (n.lt && n.rt) {
      if (!p) this.root = null
      else if (isLeft) { p.l = n.l; p.lt = true }
      else { p.r = n.r; p.rt = true }
    } else if (!n.lt && n.rt) {
      if (!p) this.root = n.l
      else if (isLeft) p.l = n.l
      else p.r = n.l
    } else if (n.lt && !n.rt) {
      if (!p) this.root = n.r
      else if (isLeft) p.l = n.r
      else p.r = n.r
    } else {
      // Two children — find inorder successor
      let s = n.r, sp = n
      while (!s.lt) { sp = s; s = s.l }
      n.k = s.k
      if (sp === n) { sp.r = s.r; sp.rt = s.rt }
      else { sp.l = s.r; sp.lt = s.rt }
    }
  }
}

// ─────────────────────────────────────────────
// 5. B-TREE (Order 5)
// ─────────────────────────────────────────────
export class BTree {
  constructor(order = 5) {
    this.order = order
    this.root = { keys: [], children: [], leaf: true }
  }

  search(k) {
    return this._search(this.root, k)
  }

  _search(n, k) {
    let i = 0
    while (i < n.keys.length && k > n.keys[i]) i++
    if (i < n.keys.length && k === n.keys[i]) return true
    if (n.leaf) return false
    return this._search(n.children[i], k)
  }

  insert(k) {
    const r = this.root
    if (r.keys.length === this.order - 1) {
      const s = { keys: [], children: [r], leaf: false }
      this.root = s
      this._split(s, 0)
      this._insertNonFull(s, k)
    } else {
      this._insertNonFull(r, k)
    }
  }

  _split(parent, i) {
    const t = Math.floor(this.order / 2)
    const y = parent.children[i]
    const z = { keys: y.keys.splice(t), children: [], leaf: y.leaf }
    const median = y.keys.pop()
    if (!y.leaf) z.children = y.children.splice(t)
    parent.children.splice(i + 1, 0, z)
    parent.keys.splice(i, 0, median)
  }

  _insertNonFull(n, k) {
    let i = n.keys.length - 1
    if (n.leaf) {
      while (i >= 0 && k < n.keys[i]) i--
      if (i >= 0 && n.keys[i] === k) return
      n.keys.splice(i + 1, 0, k)
    } else {
      while (i >= 0 && k < n.keys[i]) i--
      if (i >= 0 && n.keys[i] === k) return
      i++
      if (n.children[i].keys.length === this.order - 1) {
        this._split(n, i)
        if (k > n.keys[i]) i++
      }
      this._insertNonFull(n.children[i], k)
    }
  }

  delete(k) { this._delete(this.root, k); if (this.root.keys.length === 0 && !this.root.leaf) this.root = this.root.children[0] }

  _delete(n, k) {
    const t = Math.floor(this.order / 2)
    let i = 0
    while (i < n.keys.length && k > n.keys[i]) i++
    if (n.leaf) { const idx = n.keys.indexOf(k); if (idx !== -1) n.keys.splice(idx, 1); return }
    if (i < n.keys.length && n.keys[i] === k) {
      if (n.children[i].keys.length >= t) {
        let pred = n.children[i]; while (!pred.leaf) pred = pred.children[pred.keys.length]
        n.keys[i] = pred.keys[pred.keys.length - 1]; this._delete(n.children[i], n.keys[i])
      } else if (n.children[i + 1].keys.length >= t) {
        let succ = n.children[i + 1]; while (!succ.leaf) succ = succ.children[0]
        n.keys[i] = succ.keys[0]; this._delete(n.children[i + 1], n.keys[i])
      } else {
        const left = n.children[i], right = n.children[i + 1]
        left.keys.push(k, ...right.keys)
        if (!left.leaf) left.children.push(...right.children)
        n.keys.splice(i, 1); n.children.splice(i + 1, 1)
        this._delete(left, k)
      }
    } else {
      if (n.children[i].keys.length < t) this._fill(n, i, t)
      if (i > n.keys.length) this._delete(n.children[i - 1], k)
      else this._delete(n.children[i], k)
    }
  }

  _fill(n, i, t) {
    if (i > 0 && n.children[i - 1].keys.length >= t) {
      const child = n.children[i], sib = n.children[i - 1]
      child.keys.unshift(n.keys[i - 1])
      n.keys[i - 1] = sib.keys.pop()
      if (!child.leaf) child.children.unshift(sib.children.pop())
    } else if (i < n.children.length - 1 && n.children[i + 1].keys.length >= t) {
      const child = n.children[i], sib = n.children[i + 1]
      child.keys.push(n.keys[i])
      n.keys[i] = sib.keys.shift()
      if (!child.leaf) child.children.push(sib.children.shift())
    } else {
      if (i < n.children.length - 1) {
        const left = n.children[i], right = n.children[i + 1]
        left.keys.push(n.keys[i], ...right.keys)
        if (!left.leaf) left.children.push(...right.children)
        n.keys.splice(i, 1); n.children.splice(i + 1, 1)
      } else {
        const left = n.children[i - 1], right = n.children[i]
        left.keys.push(n.keys[i - 1], ...right.keys)
        if (!left.leaf) left.children.push(...right.children)
        n.keys.splice(i - 1, 1); n.children.splice(i, 1)
      }
    }
  }
}

// ─────────────────────────────────────────────
// 6. B+ TREE (Order 5)
// ─────────────────────────────────────────────
export class BPlusTree {
  constructor(order = 5) {
    this.order = order
    this.root = { keys: [], children: [], leaf: true, next: null }
  }

  search(k) {
    let n = this.root
    while (!n.leaf) { let i = 0; while (i < n.keys.length && k >= n.keys[i]) i++; n = n.children[i] }
    return n.keys.includes(k)
  }

  insert(k) {
    const result = this._ins(this.root, k)
    if (result) {
      const newRoot = { keys: [result.key], children: [this.root, result.right], leaf: false, next: null }
      this.root = newRoot
    }
  }

  _ins(n, k) {
    if (n.leaf) {
      let i = 0; while (i < n.keys.length && k > n.keys[i]) i++
      if (i < n.keys.length && n.keys[i] === k) return null
      n.keys.splice(i, 0, k)
      if (n.keys.length >= this.order) return this._splitLeaf(n)
      return null
    }
    let i = 0; while (i < n.keys.length && k >= n.keys[i]) i++
    const result = this._ins(n.children[i], k)
    if (!result) return null
    n.keys.splice(i, 0, result.key)
    n.children.splice(i + 1, 0, result.right)
    if (n.keys.length >= this.order) return this._splitInternal(n)
    return null
  }

  _splitLeaf(n) {
    const mid = Math.floor(n.keys.length / 2)
    const right = { keys: n.keys.splice(mid), children: [], leaf: true, next: n.next }
    n.next = right
    return { key: right.keys[0], right }
  }

  _splitInternal(n) {
    const mid = Math.floor(n.keys.length / 2)
    const key = n.keys[mid]
    const rightKeys = n.keys.splice(mid + 1)
    n.keys.pop()
    const rightChildren = n.children.splice(mid + 1)
    const right = { keys: rightKeys, children: rightChildren, leaf: false, next: null }
    return { key, right }
  }

  delete(k) {
    this._del(this.root, k)
    if (!this.root.leaf && this.root.keys.length === 0 && this.root.children.length === 1) {
      this.root = this.root.children[0]
    }
  }

  _del(n, k) {
    if (n.leaf) { const i = n.keys.indexOf(k); if (i !== -1) n.keys.splice(i, 1); return }
    let i = 0; while (i < n.keys.length && k >= n.keys[i]) i++
    this._del(n.children[i], k)
    // Rebalance if needed
    const minKeys = Math.floor((this.order - 1) / 2)
    if (n.children[i].keys.length < minKeys) {
      if (i > 0 && n.children[i - 1].keys.length > minKeys) {
        // Borrow from left
        const child = n.children[i], left = n.children[i - 1]
        if (child.leaf) { child.keys.unshift(left.keys.pop()); n.keys[i - 1] = child.keys[0] }
        else { child.keys.unshift(n.keys[i - 1]); n.keys[i - 1] = left.keys.pop(); child.children.unshift(left.children.pop()) }
      } else if (i < n.children.length - 1 && n.children[i + 1].keys.length > minKeys) {
        // Borrow from right
        const child = n.children[i], right = n.children[i + 1]
        if (child.leaf) { child.keys.push(right.keys.shift()); n.keys[i] = right.keys[0] }
        else { child.keys.push(n.keys[i]); n.keys[i] = right.keys.shift(); child.children.push(right.children.shift()) }
      } else {
        // Merge
        if (i < n.children.length - 1) {
          const left = n.children[i], right = n.children[i + 1]
          if (!left.leaf) left.keys.push(n.keys[i])
          left.keys.push(...right.keys)
          if (!left.leaf) left.children.push(...right.children)
          if (left.leaf) left.next = right.next
          n.keys.splice(i, 1); n.children.splice(i + 1, 1)
        } else {
          const left = n.children[i - 1], right = n.children[i]
          if (!left.leaf) left.keys.push(n.keys[i - 1])
          left.keys.push(...right.keys)
          if (!left.leaf) left.children.push(...right.children)
          if (left.leaf) left.next = right.next
          n.keys.splice(i - 1, 1); n.children.splice(i, 1)
        }
      }
    }
  }
}
