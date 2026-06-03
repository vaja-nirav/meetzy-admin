import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = {
  male: '#3b82f6',
  female: '#ec4899',
  other: '#6b7280',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-meetzy-card border border-meetzy-border rounded-lg p-3 text-sm">
      <p className="text-white font-semibold capitalize">{payload[0]?.name}</p>
      <p className="text-meetzy-muted">{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

function GenderPieChart({ data = {} }) {
  const chartData = [
    { name: 'Male', value: data.male || 0, color: COLORS.male },
    { name: 'Female', value: data.female || 0, color: COLORS.female },
    { name: 'Other', value: data.other || 0, color: COLORS.other },
  ].filter((d) => d.value > 0)

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-meetzy-muted text-sm">
        No data available
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-6 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-meetzy-muted text-xs">
              {entry.name}{' '}
              <span className="text-white font-medium">
                {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Memoized so the dashboard's 1-second "Refreshing in Ns" countdown can't
// re-render this mid-animation (which restarted the sweep and caused a stutter).
// Re-renders only when the genderStats reference actually changes.
export default memo(GenderPieChart)
