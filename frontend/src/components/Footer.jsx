export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center text-sm">
              ⚡
            </div>
            <span className="text-sm text-gray-400">
              <span className="font-semibold text-gray-300">Neuro-DS</span> v3.0
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {[
              { label: 'React', color: '#61dafb' },
              { label: 'Vite', color: '#646cff' },
              { label: 'FastAPI', color: '#009688' },
              { label: 'Gemini AI', color: '#8b5cf6' },
              { label: 'Recharts', color: '#ff7300' },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="text-[10px] px-2 py-0.5 rounded border font-medium"
                style={{ color, borderColor: `${color}33`, backgroundColor: `${color}10` }}
              >
                {label}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            AI-Powered Data Structure Intelligence
          </p>
        </div>
      </div>
    </footer>
  )
}
