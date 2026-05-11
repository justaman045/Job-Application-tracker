import { useState } from 'react'
import { Archive, Trash2, Tags, Plus, X } from 'lucide-react'
import { STATUSES } from '../../lib/constants'
import { ConfirmDialog } from '../shared/ConfirmDialog'

export function BulkActions({ count, onUpdateStatus, onArchive, onDelete, onAddTag, onRemoveTag, commonTags }) {
  const [showDelete, setShowDelete] = useState(false)
  const [showAddTag, setShowAddTag] = useState(false)
  const [tagInput, setTagInput] = useState('')

  if (count === 0) return null

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    onAddTag?.(tagInput.trim())
    setTagInput('')
    setShowAddTag(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg animate-fade-in">
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{count} selected</span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            onChange={(e) => { if (e.target.value) { onUpdateStatus(e.target.value); e.target.value = '' } }}
            value=""
            className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 dark:text-gray-200"
          >
            <option value="">Change status...</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {showAddTag ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tag name..."
                className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 dark:text-gray-200 w-28"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') { setShowAddTag(false); setTagInput('') } }}
              />
              <button onClick={handleAddTag} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowAddTag(false); setTagInput('') }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddTag(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              <Tags className="w-3.5 h-3.5" /> Add Tag
            </button>
          )}

          {commonTags && commonTags.length > 0 && (
            <select
              onChange={(e) => { if (e.target.value) { onRemoveTag?.(e.target.value); e.target.value = '' } }}
              value=""
              className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 dark:text-gray-200"
            >
              <option value="">Remove tag...</option>
              {commonTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}

          <button onClick={onArchive} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
          <button onClick={() => setShowDelete(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={showDelete}
        title={`Delete ${count} application${count > 1 ? 's' : ''}?`}
        message="This action cannot be undone."
        confirmLabel="Delete All"
        onConfirm={() => { setShowDelete(false); onDelete?.() }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  )
}
