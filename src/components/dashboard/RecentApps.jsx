import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

export function RecentApps({ apps }) {
  const navigate = useNavigate()

  if (!apps || !apps.length) {
    return <EmptyState icon="inbox" title="No applications yet" message="Add your first application to start tracking." actionLabel="Add Application" actionTo="/applications/new" />
  }

  return (
    <div className="space-y-2">
      {apps.slice(0, 5).map((app) => (
        <button
          key={app.id}
          onClick={() => navigate(`/applications/${app.id}`)}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{app.companyName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.position}</p>
          </div>
          <div className="flex items-center gap-3 ml-3">
            <StatusBadge status={app.status} />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  )
}
