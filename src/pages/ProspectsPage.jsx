import { useNavigate } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { EmptyState } from '../components/shared/EmptyState'
import { Send } from 'lucide-react'
import { format } from 'date-fns'

export function ProspectsPage() {
  const navigate = useNavigate()
  const { apps, loading, error } = useApplications()

  const prospects = apps.filter((a) => a.prospect)

  if (loading) return <CardSkeleton count={4} />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prospects / Wishlist</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Companies you're interested in applying to</p>
      </div>

      {prospects.length === 0 ? (
        <EmptyState icon="file" title="No prospects yet" message="When adding an application, check 'Save as prospect' to track companies you're interested in." actionLabel="Add a Prospect" actionTo="/applications/new" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prospects.map((app) => (
            <div key={app.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all">
              <div onClick={() => navigate(`/applications/${app.id}`)} className="cursor-pointer">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{app.companyName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{app.position}</p>
                {app.prospectNotes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">{app.prospectNotes}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Added {app.createdAt?.toDate ? format(app.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/applications/new?companyName=${encodeURIComponent(app.companyName)}&position=${encodeURIComponent(app.position)}`) }}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-sm"
              >
                <Send className="w-3 h-3" /> Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
