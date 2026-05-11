import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'

export function ActivityFeed({ events }) {
  const navigate = useNavigate()

  if (!events || !events.length) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-80 overflow-y-auto">
      {events.slice(0, 20).map((event, i) => (
        <button
          key={i}
          onClick={() => navigate(`/applications/${event.appId}`)}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-3 h-3 text-indigo-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-gray-100">{event.companyName}</span>
              {' '}→{' '}
              <StatusBadge status={event.status} />
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {format(event.date, 'MMM d, yyyy')}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
