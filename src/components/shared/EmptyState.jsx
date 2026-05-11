import { useNavigate } from 'react-router-dom'
import { Inbox, SearchX, FileText } from 'lucide-react'

const icons = { inbox: Inbox, search: SearchX, file: FileText }

export function EmptyState({ icon = 'inbox', title, message, actionLabel, actionTo }) {
  const navigate = useNavigate()
  const Icon = icons[icon] || Inbox

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title || 'Nothing here yet'}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{message || 'Get started by adding your first item.'}</p>
      {actionLabel && actionTo && (
        <button
          onClick={() => navigate(actionTo)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
