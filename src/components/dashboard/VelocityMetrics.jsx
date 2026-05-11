import { useMemo } from 'react'
import { Activity } from 'lucide-react'

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  return new Date(val)
}

export function VelocityMetrics({ apps }) {
  const metrics = useMemo(() => {
    const transitions = {
      applied_to_screening: [],
      screening_to_interview: [],
      interview_to_offer: [],
      offer_to_accepted: [],
      offer_to_rejected: [],
      overall: [],
    }

    for (const app of apps) {
      const history = app.statusHistory || []
      let appliedDate = null

      for (let i = 0; i < history.length; i++) {
        const entry = history[i]
        const date = toDate(entry.changedAt)
        if (!date) continue

        if (entry.status === 'applied') appliedDate = date

        if (i > 0) {
          const prev = history[i - 1]
          const prevDate = toDate(prev.changedAt)
          if (prevDate && date) {
            const days = (date - prevDate) / (1000 * 60 * 60 * 24)
            if (days > 0 && days < 365) {
              const key = `${prev.status}_to_${entry.status}`
              if (transitions[key]) transitions[key].push(Math.round(days * 10) / 10)
            }
          }
        }
      }

      if (appliedDate && history.length > 1) {
        const lastEntry = history[history.length - 1]
        const lastDate = toDate(lastEntry.changedAt)
        if (lastDate && lastEntry.status !== 'applied') {
          const days = (lastDate - appliedDate) / (1000 * 60 * 60 * 24)
          if (days > 0) transitions.overall.push(Math.round(days * 10) / 10)
        }
      }
    }

    const avg = (arr) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null

    return [
      { label: 'Applied → Screening', value: avg(transitions.applied_to_screening), suffix: 'd', count: transitions.applied_to_screening.length },
      { label: 'Screening → Interview', value: avg(transitions.screening_to_interview), suffix: 'd', count: transitions.screening_to_interview.length },
      { label: 'Interview → Offer', value: avg(transitions.interview_to_offer), suffix: 'd', count: transitions.interview_to_offer.length },
      { label: 'Offer → Accepted', value: avg(transitions.offer_to_accepted), suffix: 'd', count: transitions.offer_to_accepted.length },
      { label: 'Overall Avg Time', value: avg(transitions.overall), suffix: 'd', count: transitions.overall.length },
    ]
  }, [apps])

  const anyData = metrics.some((m) => m.value !== null)
  if (!anyData) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-indigo-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Velocity Metrics</h3>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{m.label}</span>
              {m.count > 0 && <span className="text-[10px] text-gray-400 dark:text-gray-500">({m.count})</span>}
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {m.value !== null ? `${m.value}${m.suffix}` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
