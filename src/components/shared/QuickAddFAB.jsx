import { useState, useEffect } from 'react'
import { Plus, X, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../../hooks/useApplications'
import { useToast } from '../../contexts/ToastContext'

export function QuickAddFAB() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen((v) => !v)
    window.addEventListener('north:toggle-quickadd', handler)
    return () => window.removeEventListener('north:toggle-quickadd', handler)
  }, [])
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const { addApplication } = useApplications()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim() || !position.trim()) return
    setSaving(true)
    try {
      const id = await addApplication({
        companyName: company.trim(),
        position: position.trim(),
        status: 'applied',
        applicationDate: new Date().toISOString().split('T')[0],
      })
      addToast('Application added', 'success')
      setOpen(false)
      setCompany('')
      setPosition('')
      navigate(`/applications/${id}`)
    } catch {
      addToast('Failed to add application', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      )}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-3">
        {open && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 w-72 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Position"
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={saving || !company.trim() || !position.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-violet-700 transition-all active:scale-95 flex items-center justify-center"
          aria-label="Quick add application"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  )
}
