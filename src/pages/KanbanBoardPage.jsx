import { useMemo } from 'react'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../contexts/ToastContext'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'

export function KanbanBoardPage() {
  const { apps, loading, error, updateApplication } = useApplications()
  const { addToast } = useToast()

  const activeApps = useMemo(() => apps.filter((a) => !a.archived), [apps])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplication(id, { status: newStatus })
      addToast('Status updated', 'success')
    } catch {
      addToast('Failed to update status', 'error')
    }
  }

  if (loading) return <CardSkeleton count={8} />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop applications between columns to update status</p>
      </div>
      <KanbanBoard apps={activeApps} onStatusChange={handleStatusChange} />
    </div>
  )
}
