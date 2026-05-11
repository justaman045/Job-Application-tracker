import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { EmptyState } from '../components/shared/EmptyState'
import { SOURCES } from '../lib/constants'

export function SalariesPage() {
  const { apps, loading, error } = useApplications()
  const navigate = useNavigate()

  const { withSalary, stats } = useMemo(() => {
    const withSalary = apps.filter((a) => a.salaryInfo || a.offerSalary)
    const bySource = {}
    const byLocation = {}
    for (const app of withSalary) {
      const src = app.applicationSource || 'unknown'
      bySource[src] = (bySource[src] || 0) + 1
      const loc = app.locationType || 'unknown'
      byLocation[loc] = (byLocation[loc] || 0) + 1
    }
    return {
      withSalary,
      stats: { bySource, byLocation },
    }
  }, [apps])

  if (loading) return <CardSkeleton count={4} />
  if (error) return <ErrorDisplay message={error} />

  if (withSalary.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Salary Analytics</h1>
        <EmptyState icon="file" title="No salary data yet" message="Add salary information to your applications to see analytics here." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{withSalary.length} applications with salary data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Apps with Salary</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{withSalary.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">By Source</span>
          </div>
          <div className="space-y-1 mt-2">
            {Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{source.replace('_', ' ')}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">By Location</span>
          </div>
          <div className="space-y-1 mt-2">
            {Object.entries(stats.byLocation).sort((a, b) => b[1] - a[1]).map(([loc, count]) => (
              <div key={loc} className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{loc.replace('_', ' ')}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Salary Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Position</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Salary Info</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {withSalary.map((app) => (
                <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{app.companyName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{app.position}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{app.salaryInfo || app.offerSalary || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{SOURCES.find(s => s.value === app.applicationSource)?.label || app.applicationSource?.replace('_', ' ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{app.locationType || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
