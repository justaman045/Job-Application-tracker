import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Edit3, Copy, Archive, Trash2, Star } from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { ConfirmDialog } from '../shared/ConfirmDialog'

export function ApplicationRow({ app, selected, onSelect, onDuplicate, onArchive, onDelete }) {
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)

  const date = app.applicationDate?.toDate ? app.applicationDate.toDate() : app.applicationDate ? new Date(app.applicationDate) : null

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(app.id)}
          className="rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500"
        />
          <div className="min-w-0 flex-1 grid grid-cols-12 gap-3 items-center cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
            <div className="col-span-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{app.companyName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                {app.position}
                {app.tags?.slice(0, 2).map((tag, i) => (
                  <span key={i} className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    ['bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300','bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300','bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300','bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300','bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300','bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'][i % 6]}`}>{tag}</span>
                ))}
              </p>
            </div>
          <div className="col-span-2">
            <StatusBadge status={app.status} />
          </div>
          <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
            {date ? format(date, 'MMM d, yyyy') : '—'}
          </div>
          <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
            {app.applicationSource?.replace('_', ' ') || '—'}
          </div>
          <div className="col-span-1 flex items-center">
            {app.companyRating ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: app.companyRating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
            )}
          </div>
          <div className="col-span-2 flex items-center gap-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}?edit=true`) }} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors" title="Edit" aria-label="Edit application">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate?.(app.id) }} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="Duplicate" aria-label="Duplicate application">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onArchive?.(app.id) }} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors" title="Archive" aria-label="Archive application">
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowDelete(true) }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete" aria-label="Delete application">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application at ${app.companyName}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { setShowDelete(false); onDelete?.(app.id) }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  )
}
