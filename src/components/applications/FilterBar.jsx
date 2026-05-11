import { Search, RotateCcw } from 'lucide-react'
import { STATUSES, SOURCES, LOCATION_TYPES } from '../../lib/constants'
import { DateRangeFilter } from './DateRangeFilter'

export function FilterBar({ filters, onChange, searchRef, onClear }) {
  const hasFilters = filters.search || filters.status || filters.source || filters.locationType || filters.dateFrom || filters.dateTo

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search company or position... (Press / to focus)"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-200 dark:placeholder-gray-500"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.source || ''}
          onChange={(e) => handleChange('source', e.target.value)}
          className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200"
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.locationType || ''}
          onChange={(e) => handleChange('locationType', e.target.value)}
          className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200"
        >
          <option value="">All locations</option>
          {LOCATION_TYPES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <DateRangeFilter
          dateFrom={filters.dateFrom || ''}
          dateTo={filters.dateTo || ''}
          onChange={handleChange}
        />
        <select
          value={filters.archived || 'active'}
          onChange={(e) => handleChange('archived', e.target.value)}
          className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
        {hasFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
