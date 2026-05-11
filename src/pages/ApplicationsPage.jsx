import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../contexts/ToastContext'
import { FilterBar } from '../components/applications/FilterBar'
import { SavedFilters } from '../components/applications/SavedFilters'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { BulkActions } from '../components/applications/BulkActions'
import { ApplicationsSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'

export function ApplicationsPage() {
  const { searchRef } = useOutletContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { apps, loading, error, duplicateApplication, archiveApplication, deleteApplication, bulkUpdateStatus, bulkArchive, bulkDelete, bulkAddTag, bulkRemoveTag } = useApplications()
  const { addToast } = useToast()
  const [selected, setSelected] = useState(new Set())
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '', status: '', source: '', locationType: '', dateFrom: '', dateTo: '', archived: 'active',
  })

  const filtered = useMemo(() => {
    let result = [...apps]
    if (filters.archived === 'active') result = result.filter((a) => !a.archived)
    else if (filters.archived === 'archived') result = result.filter((a) => a.archived)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((a) =>
        (a.companyName || '').toLowerCase().includes(q) ||
        (a.position || '').toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }
    if (filters.status) result = result.filter((a) => a.status === filters.status)
    if (filters.source) result = result.filter((a) => a.applicationSource === filters.source)
    if (filters.locationType) result = result.filter((a) => a.locationType === filters.locationType)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      result = result.filter((a) => {
        const d = a.applicationDate?.toDate ? a.applicationDate.toDate() : new Date(a.applicationDate)
        return d >= from
      })
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter((a) => {
        const d = a.applicationDate?.toDate ? a.applicationDate.toDate() : new Date(a.applicationDate)
        return d <= to
      })
    }
    return result
  }, [apps, filters])

  useEffect(() => { setSelected(new Set()) }, [filters]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSelectAll = useCallback((checked) => {
    if (checked) setSelected(new Set(filtered.map((a) => a.id)))
    else setSelected(new Set())
  }, [filtered])

  const handleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDuplicate = useCallback(async (id) => {
    try {
      await duplicateApplication(id)
      addToast('Application duplicated', 'success')
    } catch { addToast('Failed to duplicate', 'error') }
  }, [duplicateApplication, addToast])

  const handleArchive = useCallback(async (id) => {
    try {
      await archiveApplication(id)
      addToast('Application archived', 'success')
    } catch { addToast('Failed to archive', 'error') }
  }, [archiveApplication, addToast])

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteApplication(id)
      addToast('Application deleted', 'success')
    } catch { addToast('Failed to delete', 'error') }
  }, [deleteApplication, addToast])

  const handleBulkStatus = useCallback(async (status) => {
    try {
      await bulkUpdateStatus([...selected], status)
      addToast(`Updated ${selected.size} applications`, 'success')
      setSelected(new Set())
    } catch { addToast('Failed to update', 'error') }
  }, [selected, bulkUpdateStatus, addToast])

  const handleBulkArchive = useCallback(async () => {
    try {
      await bulkArchive([...selected])
      addToast(`Archived ${selected.size} applications`, 'success')
      setSelected(new Set())
    } catch { addToast('Failed to archive', 'error') }
  }, [selected, bulkArchive, addToast])

  const commonTags = useMemo(() => {
    if (selected.size === 0) return []
    const selectedApps = apps.filter((a) => selected.has(a.id))
    const tagSets = selectedApps.map((a) => new Set(a.tags || []))
    if (tagSets.length === 0) return []
    const common = tagSets.reduce((acc, set) => {
      const result = new Set()
      for (const tag of acc) if (set.has(tag)) result.add(tag)
      return result
    }, tagSets[0])
    return [...common]
  }, [apps, selected])

  const handleAddTag = useCallback(async (tag) => {
    try {
      await bulkAddTag([...selected], tag)
      addToast(`Tag "${tag}" added to ${selected.size} applications`, 'success')
    } catch { addToast('Failed to add tag', 'error') }
  }, [selected, bulkAddTag, addToast])

  const handleRemoveTag = useCallback(async (tag) => {
    try {
      await bulkRemoveTag([...selected], tag)
      addToast(`Tag "${tag}" removed from ${selected.size} applications`, 'success')
    } catch { addToast('Failed to remove tag', 'error') }
  }, [selected, bulkRemoveTag, addToast])

  const handleBulkDelete = useCallback(async () => {
    try {
      await bulkDelete([...selected])
      addToast(`Deleted ${selected.size} applications`, 'success')
      setSelected(new Set())
    } catch { addToast('Failed to delete', 'error') }
  }, [selected, bulkDelete, addToast])

  if (loading) return <ApplicationsSkeleton />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} of {apps.length} applications</p>
        </div>
        <button
          onClick={() => navigate('/applications/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
        >
          <Send className="w-4 h-4" /> New Application
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} searchRef={searchRef} onClear={() => setFilters({ search: '', status: '', source: '', locationType: '', dateFrom: '', dateTo: '', archived: 'active' })} />

      <div className="flex items-center justify-between">
        <SavedFilters currentFilters={filters} onApply={(f) => setFilters({ ...filters, ...f })} />
        {selected.size > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{selected.size} selected</span>
        )}
      </div>

      {selected.size > 0 && (
        <BulkActions
          count={selected.size}
          onUpdateStatus={handleBulkStatus}
          onArchive={handleBulkArchive}
          onDelete={handleBulkDelete}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          commonTags={commonTags}
        />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <ApplicationTable
          apps={filtered}
          selected={selected}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
