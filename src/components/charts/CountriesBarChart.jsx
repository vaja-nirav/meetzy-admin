import { Globe } from 'lucide-react'

// Turn a 2-letter ISO country code (e.g. "IN") into a flag emoji 🇮🇳.
function flagFor(code) {
  if (!code || code.length !== 2) return null
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

const RANK_COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899']

export default function CountriesBarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-meetzy-muted text-sm gap-2">
        <Globe size={28} className="opacity-40" />
        No data available
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0)
  const max = Math.max(...data.map((d) => d.count || 0), 1)

  return (
    <div className="space-y-4">
      {data.map((c, i) => {
        const count = c.count || 0
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        const barWidth = Math.max(6, Math.round((count / max) * 100)) // keep a sliver visible
        const color = RANK_COLORS[i % RANK_COLORS.length]
        const flag = flagFor(c.code)

        return (
          <div key={c.name || i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-meetzy-muted text-xs font-semibold w-4 flex-shrink-0">
                  {i + 1}
                </span>
                {flag ? (
                  <span className="text-base leading-none">{flag}</span>
                ) : (
                  <Globe size={14} className="text-meetzy-muted flex-shrink-0" />
                )}
                <span className="text-white text-sm font-medium truncate">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {count.toLocaleString()}
                </span>
                <span className="text-meetzy-muted text-xs">({pct}%)</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-meetzy-hover overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
