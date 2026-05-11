export function DateRangeFilter({ dateFrom, dateTo, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onChange('dateFrom', e.target.value)}
        className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 dark:text-gray-200 w-36"
        placeholder="From"
      />
      <span className="text-gray-400 text-xs">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onChange('dateTo', e.target.value)}
        className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 dark:text-gray-200 w-36"
        placeholder="To"
      />
    </div>
  )
}
