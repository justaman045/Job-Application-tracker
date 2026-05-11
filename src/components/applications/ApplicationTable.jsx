import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ApplicationRow } from './ApplicationRow'
import { EmptyState } from '../shared/EmptyState'
import { ITEMS_PER_PAGE } from '../../lib/constants'

function SortHeader({ label, sortKey, sort, onSort }) {
  return (
    <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 uppercase tracking-wider">
      {label}
      <span className={`w-3 h-3 transition-colors ${sort.key === sortKey ? 'text-indigo-500' : ''}`}>↑↓</span>
    </button>
  )
}

export function ApplicationTable({ apps, selected, onSelectAll, onSelect, onDuplicate, onArchive, onDelete }) {
  const [sort, setSort] = useState({ key: 'applicationDate', dir: 'desc' })
  const [page, setPage] = useState(0)

  const handleSort = (key) => {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const sorted = [...apps].sort((a, b) => {
    let aVal, bVal
    switch (sort.key) {
      case 'companyName':
        aVal = (a.companyName || '').toLowerCase(); bVal = (b.companyName || '').toLowerCase()
        break
      case 'status':
        aVal = a.status || ''; bVal = b.status || ''
        break
      case 'applicationDate':
        aVal = a.applicationDate?.toDate?.()?.getTime() || new Date(a.applicationDate || 0).getTime()
        bVal = b.applicationDate?.toDate?.()?.getTime() || new Date(b.applicationDate || 0).getTime()
        break
      case 'companyRating':
        aVal = a.companyRating || 0; bVal = b.companyRating || 0
        break
      default:
        aVal = a[sort.key] || ''; bVal = b[sort.key] || ''
    }
    if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1
    if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paged = sorted.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
  const allSelected = apps.length > 0 && selected.size === apps.length

  if (!apps.length) {
    return <EmptyState icon="search" title="No applications match your filters" message="Try adjusting your search or filters." />
  }

  return (
    <div>
      <div className="hidden md:block">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onSelectAll?.(!allSelected)}
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500"
          />
          <div className="flex-1 grid grid-cols-12 gap-3">
            <div className="col-span-3"><SortHeader label="Company" sortKey="companyName" sort={sort} onSort={handleSort} /></div>
            <div className="col-span-2"><SortHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} /></div>
            <div className="col-span-2"><SortHeader label="Date" sortKey="applicationDate" sort={sort} onSort={handleSort} /></div>
            <div className="col-span-2"><span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</span></div>
            <div className="col-span-1"><SortHeader label="Rating" sortKey="companyRating" sort={sort} onSort={handleSort} /></div>
            <div className="col-span-2" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {paged.map((app) => (
          <ApplicationRow
            key={app.id}
            app={app}
            selected={selected.has(app.id)}
            onSelect={onSelect}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
