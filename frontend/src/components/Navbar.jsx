import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/benchmark', label: 'Benchmark', icon: '⚡' },
  { path: '/encyclopedia', label: 'Encyclopedia', icon: '📚' },
  { path: '/history', label: 'History', icon: '📜' },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              ⚡
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Neuro</span>
              <span className="text-gray-300">-DS</span>
              <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 align-top">
                v3.0
              </span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
