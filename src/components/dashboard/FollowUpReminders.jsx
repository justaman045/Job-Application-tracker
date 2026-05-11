import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Clock } from 'lucide-react'
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns'

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  if (typeof val === 'string') return parseISO(val)
  return new Date(val)
}

export function FollowUpReminders({ apps }) {
  const navigate = useNavigate()

  const followUps = useMemo(() => {
    const items = apps
      .filter((a) => a.followUpDate && !a.archived)
      .map((a) => ({
        id: a.id,
        companyName: a.companyName,
        position: a.position,
        date: toDate(a.followUpDate),
        status: a.status,
      }))
      .filter((a) => a.date)
      .sort((a, b) => a.date - b.date)
      .slice(0, 10)
    return items
  }, [apps])

  const upcoming = followUps.filter((f) => !isPast(f.date))
  const overdue = followUps.filter((f) => isPast(f.date))

  if (!followUps.length) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Follow-up Reminders</h3>
        <Bell className="w-4 h-4 text-gray-400" />
      </div>
      <div className="space-y-2">
        {overdue.slice(0, 3).map((f) => (
          <button key={f.id} onClick={() => navigate(`/applications/${f.id}`)}
            className="w-full flex items-center gap-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.companyName}</p>
              <p className="text-xs text-red-500">Overdue — {format(f.date, 'MMM d')}</p>
            </div>
          </button>
        ))}
        {upcoming.slice(0, 5 - overdue.slice(0, 3).length).map((f) => (
          <button key={f.id} onClick={() => navigate(`/applications/${f.id}`)}
            className="w-full flex items-center gap-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.companyName}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {isToday(f.date) ? 'Today' : isTomorrow(f.date) ? 'Tomorrow' : format(f.date, 'MMM d')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
