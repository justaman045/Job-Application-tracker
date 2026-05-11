import { useState } from 'react'
import { Plus, Circle } from 'lucide-react'
import { INTERVIEW_OUTCOMES } from '../../lib/constants'
import { format } from 'date-fns'

export function InterviewRounds({ rounds = [], onChange }) {
  const [editing, setEditing] = useState(null)
  const [newRound, setNewRound] = useState(false)

  const addRound = () => {
    const round = { id: crypto.randomUUID(), roundName: '', date: '', notes: '', outcome: 'waiting' }
    setNewRound(false)
    onChange([...rounds, round])
    setEditing(round.id)
  }

  const updateRound = (id, field, value) => {
    onChange(rounds.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }

  const removeRound = (id) => {
    onChange(rounds.filter((r) => r.id !== id))
    if (editing === id) setEditing(null)
  }

  if (!rounds.length && !newRound) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No interview rounds yet</p>
        <button onClick={() => setNewRound(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Round
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Interview Rounds</h4>
        <button onClick={addRound} className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {rounds.map((round, i) => (
          <div key={round.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex flex-col items-center pt-1">
              <Circle className="w-3 h-3 text-indigo-400" />
              {i < rounds.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
            </div>
            <div className="flex-1 min-w-0">
              {editing === round.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={round.roundName}
                    onChange={(e) => updateRound(round.id, 'roundName', e.target.value)}
                    placeholder="Round name (e.g. HR Phone Screen)"
                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:text-gray-200"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={round.date}
                      onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                      className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:text-gray-200 flex-1"
                    />
                    <select
                      value={round.outcome}
                      onChange={(e) => updateRound(round.id, 'outcome', e.target.value)}
                      className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:text-gray-200"
                    >
                      {INTERVIEW_OUTCOMES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={round.notes}
                    onChange={(e) => updateRound(round.id, 'notes', e.target.value)}
                    placeholder="Notes about this round..."
                    rows={2}
                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 dark:text-gray-200 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)} className="text-xs text-indigo-500 hover:text-indigo-700">Done</button>
                    <button onClick={() => removeRound(round.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => setEditing(round.id)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{round.roundName || 'New Round'}</p>
                    <div className="flex items-center gap-2">
                      {round.date && <span className="text-xs text-gray-400">{format(new Date(round.date), 'MMM d')}</span>}
                      {round.outcome && round.outcome !== 'waiting' && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          round.outcome === 'passed' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          round.outcome === 'failed' ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' :
                          'text-gray-400 bg-gray-50 dark:bg-gray-800'
                        }`}>
                          {INTERVIEW_OUTCOMES.find((o) => o.value === round.outcome)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {round.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{round.notes}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
