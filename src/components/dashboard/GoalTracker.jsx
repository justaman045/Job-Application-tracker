import { useState, useEffect } from 'react'
import { Target, Settings } from 'lucide-react'

const STORAGE_KEY = 'north-goals'

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function GoalTracker({ apps }) {
  const [goals, setGoals] = useState(() => loadGoals())
  const [showSettings, setShowSettings] = useState(false)
  const [form, setForm] = useState({ weekly: goals.weekly || 5, monthly: goals.monthly || 20 })

  useEffect(() => { saveGoals(goals) }, [goals])

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const weeklyCount = apps.filter((a) => {
    const d = a.applicationDate?.toDate ? a.applicationDate.toDate() : new Date(a.applicationDate)
    return d >= startOfWeek
  }).length

  const monthlyCount = apps.filter((a) => {
    const d = a.applicationDate?.toDate ? a.applicationDate.toDate() : new Date(a.applicationDate)
    return d >= startOfMonth
  }).length

  const weeklyPct = goals.weekly ? Math.min(100, Math.round((weeklyCount / goals.weekly) * 100)) : 0
  const monthlyPct = goals.monthly ? Math.min(100, Math.round((monthlyCount / goals.monthly) * 100)) : 0

  const handleSave = () => {
    setGoals({ weekly: form.weekly, monthly: form.monthly })
    setShowSettings(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Goals</h3>
        <button onClick={() => setShowSettings(true)} className="p-1 text-gray-400 hover:text-indigo-500 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-400">This Week</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{weeklyCount}/{goals.weekly || 0}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all" style={{ width: `${weeklyPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-400">This Month</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{monthlyCount}/{goals.monthly || 0}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all" style={{ width: `${monthlyPct}%` }} />
          </div>
        </div>
      </div>

      {showSettings && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowSettings(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Set Goals</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applications per Week</label>
                  <input type="number" min={1} max={100} value={form.weekly} onChange={(e) => setForm({ ...form, weekly: Number(e.target.value) })}
                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applications per Month</label>
                  <input type="number" min={1} max={500} value={form.monthly} onChange={(e) => setForm({ ...form, monthly: Number(e.target.value) })}
                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all">Save Goals</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
