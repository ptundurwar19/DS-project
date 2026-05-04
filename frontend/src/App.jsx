import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Benchmark from './pages/Benchmark'
import History from './pages/History'
import Encyclopedia from './pages/Encyclopedia'

/** Safely parse JSON from sessionStorage */
function loadSession(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function App() {
  const [results, setResults] = useState(() => loadSession('neurods-ai-results'))
  const [benchmarkResults, setBenchmarkResults] = useState(() => loadSession('neurods-bench-results'))

  // Persist to sessionStorage whenever results change
  useEffect(() => {
    if (results) sessionStorage.setItem('neurods-ai-results', JSON.stringify(results))
    else sessionStorage.removeItem('neurods-ai-results')
  }, [results])

  useEffect(() => {
    if (benchmarkResults) sessionStorage.setItem('neurods-bench-results', JSON.stringify(benchmarkResults))
    else sessionStorage.removeItem('neurods-bench-results')
  }, [benchmarkResults])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-900 flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <Routes>
            <Route path="/" element={
              <Home
                onResults={setResults}
                onBenchmarkResults={setBenchmarkResults}
              />
            } />
            <Route path="/dashboard" element={
              <Dashboard
                results={results}
                benchmarkResults={benchmarkResults}
              />
            } />
            <Route path="/benchmark" element={
              <Benchmark
                onResults={setBenchmarkResults}
              />
            } />
            <Route path="/encyclopedia" element={<Encyclopedia />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
