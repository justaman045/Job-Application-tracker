import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle } from 'lucide-react'

const TERMINAL_STATUSES = ['offer', 'accepted', 'rejected', 'withdrawn', 'ghosted']

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  return new Date(val)
}

function daysSinceLastChange(app) {
  const history = app.statusHistory || []
  if (history.length === 0) return 0
  const last = history[history.length - 1]
  const changedAt = toDate(last.changedAt) || toDate(app.applicationDate) || new Date()
  const now = new Date()
  return Math.floor((now - changedAt) / (1000 * 60 * 60 * 24))
}

export function StuckApps({ apps }) {
  const navigate = useNavigate()
  const [threshold, setThreshold] = useState(14)

  const stuck = useMemo(() => {
    return apps.filter((a) => {
      if (TERMINAL_STATUSES.includes(a.status)) return false
      if (a.archived) return false
      return daysSinceLastChange(a) >= threshold
    }).sort((a, b) => daysSinceLastChange(b) - daysSinceLastChange(a))
  }, [apps, threshold])

  if (stuck.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stuck Applications</h3>
        </div>
        <select
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 dark:text-gray-200"
        >
          <option value={7}>7+ days</option>
          <option value={14}>14+ days</option>
          <option value={30}>30+ days</option>
        </select>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {stuck.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(`/applications/${app.id}`)}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{app.companyName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.position}</p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                daysSinceLastChange(app) >= 30
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : daysSinceLastChange(app) >= 14
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Clock className="w-3 h-3" />
                {daysSinceLastChange(app)}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
