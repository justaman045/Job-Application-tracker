export function FunnelChart({ apps, stats }) {
  const stages = [
    { key: 'applied', label: 'Applied', count: (stats.statusCounts?.applied || 0) + (stats.statusCounts?.screening || 0) + (stats.statusCounts?.interview || 0) + (stats.statusCounts?.offer || 0) + (stats.statusCounts?.accepted || 0) + (stats.statusCounts?.rejected || 0) + (stats.statusCounts?.ghosted || 0) + (stats.statusCounts?.withdrawn || 0) },
    { key: 'screening', label: 'Screening', count: (stats.statusCounts?.screening || 0) + (stats.statusCounts?.interview || 0) + (stats.statusCounts?.offer || 0) + (stats.statusCounts?.accepted || 0) + (stats.statusCounts?.rejected || 0) },
    { key: 'interview', label: 'Interview', count: (stats.statusCounts?.interview || 0) + (stats.statusCounts?.offer || 0) + (stats.statusCounts?.accepted || 0) + (stats.statusCounts?.rejected || 0) },
    { key: 'offer', label: 'Offer', count: (stats.statusCounts?.offer || 0) + (stats.statusCounts?.accepted || 0) },
    { key: 'accepted', label: 'Accepted', count: stats.statusCounts?.accepted || 0 },
  ]

  const maxCount = stages[0].count || 1

  if (!apps.length) return null

  return (
    <div className="space-y-2">
      {stages.map((stage) => {
        const pct = (stage.count / maxCount) * 100
        return (
          <div key={stage.key} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">{stage.label}</span>
            <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
              <div
                className="h-full rounded transition-all bg-gradient-to-r from-indigo-400 to-violet-500"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white mix-blend-difference">
                {stage.count}
              </span>
            </div>
            <span className="text-xs text-gray-400 w-8">
              {stage.count > 0 ? Math.round((stage.count / stages[0].count) * 100) : 0}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
