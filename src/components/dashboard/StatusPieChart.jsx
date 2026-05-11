import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { STATUSES } from '../../lib/constants'

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#22c55e', '#ef4444', '#9ca3af', '#f97316']

export function StatusPieChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value], i) => ({
    name: STATUSES.find((s) => s.value === name)?.label || name,
    value,
    color: COLORS[i % COLORS.length],
  }))

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-gray-500">
        No data yet
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
