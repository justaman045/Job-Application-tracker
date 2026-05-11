export function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 dark:text-gray-100">{value ?? <span className="text-gray-300 dark:text-gray-600">—</span>}</span>
    </div>
  )
}
