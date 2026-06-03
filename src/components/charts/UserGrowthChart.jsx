import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-meetzy-card border border-meetzy-border rounded-lg p-3 text-sm">
      <p className="text-meetzy-muted mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0]?.value} users</p>
    </div>
  )
}

export default function UserGrowthChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#userGradient)"
          dot={{ fill: '#7c3aed', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#7c3aed' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
