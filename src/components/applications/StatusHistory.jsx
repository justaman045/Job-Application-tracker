import { format } from 'date-fns'
import { getStatusConfig } from '../../lib/constants'

const STATUS_DOT_COLORS = {
  applied: 'text-blue-500',
  screening: 'text-cyan-500',
  interview: 'text-violet-500',
  offer: 'text-emerald-500',
  accepted: 'text-green-500',
  rejected: 'text-red-500',
  ghosted: 'text-gray-400',
  withdrawn: 'text-orange-500',
}

export function StatusHistory({ history = [] }) {
  if (!history.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400 dark:text-gray-500">No status history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const config = getStatusConfig(entry.status)
        const date = entry.changedAt?.toDate ? entry.changedAt.toDate() : entry.changedAt ? new Date(entry.changedAt) : null
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className={`w-3 h-3 rounded-full ${STATUS_DOT_COLORS[entry.status] || 'text-gray-400'}`} />
              {i < history.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
            </div>
            <div className="pb-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
              {date && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  {format(date, 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
