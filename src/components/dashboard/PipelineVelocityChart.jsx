import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'

export function PipelineVelocityChart({ data }) {
  if (!data || !data.length || data.every((d) => d.avgDays === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
        Insufficient data yet
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.stage.charAt(0).toUpperCase() + d.stage.slice(1),
    days: d.avgDays,
    count: d.count,
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} label={{ value: 'Avg Days', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} formatter={(v) => [`${v} days`, 'Avg Duration']} />
          <Bar dataKey="days" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
