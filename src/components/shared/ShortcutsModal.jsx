import { useEffect } from 'react'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { key: 'N', desc: 'New application' },
  { key: 'C', desc: 'Quick-add FAB' },
  { key: '/', desc: 'Focus search' },
  { key: 'J / K', desc: 'Navigate table rows' },
  { key: 'Enter', desc: 'Open selected application' },
  { key: 'Ctrl+Enter', desc: 'Submit current form' },
  { key: '?', desc: 'Show this help' },
  { key: 'Esc', desc: 'Close dialogs / blur input' },
]

export function ShortcutsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
            <Keyboard className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">{s.key}</kbd>
            </div>
          ))}
        </div>
        <button
          data-close-dialog
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
