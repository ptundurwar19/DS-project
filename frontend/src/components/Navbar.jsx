import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Oracle', icon: '🧠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/history', label: 'History', icon: '📜' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              ⚡
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Neuro</span>
              <span className="text-gray-300">-DS</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
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
        </div>
      </div>
    </nav>
  )
}
