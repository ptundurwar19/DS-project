/**
 * Neuro-DS v3.0 — Local History Store (IndexedDB)
 * =================================================
 * Client-side persistence for benchmark runs and AI analyses.
 * No server required — all data stays in the browser.
 */

const DB_NAME = 'neurods-history'
const DB_VERSION = 1
const STORE_NAME = 'runs'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Save a run to local history
 * @param {object} data - { type: 'ai'|'benchmark'|'combined', config, aiResult, benchmarkResults }
 */
export async function saveRun(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const run = {
      ...data,
      timestamp: new Date().toISOString(),
    }
    const request = store.add(run)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all runs, sorted by timestamp descending
 * @param {number} limit - Max runs to return
 */
export async function getRuns(limit = 50) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('timestamp')
    const request = index.openCursor(null, 'prev')
    const results = []

    request.onsuccess = (e) => {
      const cursor = e.target.result
      if (cursor && results.length < limit) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a single run by ID
 */
export async function getRun(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete a single run
 */
export async function deleteRun(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Clear all history
 */
export async function clearAll() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
