import { getStatusConfig } from '../../lib/constants'

export function StatusBadge({ status, className = '' }) {
  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {config.label}
    </span>
  )
}
