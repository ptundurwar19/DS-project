import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

function App() {
  const [results, setResults] = useState(null)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home onResults={setResults} />} />
            <Route path="/dashboard" element={<Dashboard results={results} />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
