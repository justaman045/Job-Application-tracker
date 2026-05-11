import { useState } from 'react'
import { X, Save, Settings, Pencil, Trash2, Check } from 'lucide-react'

const STORAGE_KEY = 'north-saved-filters'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveSaved(filters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
}

export function SavedFilters({ currentFilters, onApply }) {
  const [saved, setSaved] = useState(() => loadSaved())
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [managing, setManaging] = useState(false)
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const hasFilters = currentFilters.search || currentFilters.status || currentFilters.source || currentFilters.locationType || currentFilters.dateFrom || currentFilters.dateTo

  const handleSave = () => {
    if (!name.trim() || !hasFilters) return
    const newFilter = { name: name.trim(), filters: { ...currentFilters }, id: crypto.randomUUID() }
    const updated = [...saved, newFilter]
    setSaved(updated)
    saveSaved(updated)
    setName('')
    setSaving(false)
  }

  const handleDelete = (id) => {
    const updated = saved.filter((s) => s.id !== id)
    setSaved(updated)
    saveSaved(updated)
  }

  const handleRename = (id) => {
    if (!renameValue.trim()) return
    const updated = saved.map((s) => s.id === id ? { ...s, name: renameValue.trim() } : s)
    setSaved(updated)
    saveSaved(updated)
    setRenaming(null)
    setRenameValue('')
  }

  if (saved.length === 0 && !hasFilters) return null

  return (
    <div className="flex items-center gap-2">
      {saved.length > 0 && (
        <select
          onChange={(e) => {
            const found = saved.find((s) => s.id === e.target.value)
            if (found) onApply(found.filters)
            e.target.value = ''
          }}
          value=""
          className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 w-40 appearance-none cursor-pointer"
        >
          <option value="">{managing ? 'Manage filters...' : 'Saved filters'}</option>
          {saved.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {managing && saved.length > 0 && (
        <div className="relative">
          <button onClick={() => setManaging(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-30 p-2 animate-fade-in">
            {saved.map((s) => (
              <div key={s.id} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                {renaming === s.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 dark:text-gray-200 flex-1"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(s.id); if (e.key === 'Escape') setRenaming(null) }}
                    />
                    <button onClick={() => handleRename(s.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"><Check className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{s.name}</span>
                    <button onClick={() => { setRenaming(s.id); setRenameValue(s.name) }} className="p-1 text-gray-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all rounded"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"><Trash2 className="w-3 h-3" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFilters && !managing && (
        <>
          {saving ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Filter name..."
                className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 dark:text-gray-200 w-32"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false) }}
              />
              <button onClick={handleSave} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={() => setSaving(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setSaving(true)}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save Filter
              </button>
              {saved.length > 0 && (
                <button
                  onClick={() => setManaging(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Manage saved filters"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
