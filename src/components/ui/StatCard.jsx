import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const colorClasses = {
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'purple', trend }) {
  const colors = colorClasses[color] || colorClasses.purple

  return (
    <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6 hover:border-meetzy-purple/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <p className="text-meetzy-muted text-sm font-medium">{title}</p>
        {Icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
            <Icon size={22} className={colors.text} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value ?? '—'}</p>
      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend > 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
        {subtitle && <p className="text-meetzy-muted text-sm">{subtitle}</p>}
      </div>
    </div>
  )
}
