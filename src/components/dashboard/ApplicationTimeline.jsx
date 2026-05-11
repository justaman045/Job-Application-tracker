import { useNavigate } from 'react-router-dom'

const statusOrder = ['applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'ghosted', 'withdrawn']

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  return new Date(val)
}

export function ApplicationTimeline({ apps }) {
  const navigate = useNavigate()
  const active = apps.filter((a) => ['applied', 'screening', 'interview'].includes(a.status)).slice(0, 10)

  if (!active.length) return null

  const statusColors = {
    applied: 'bg-blue-500', screening: 'bg-cyan-500', interview: 'bg-violet-500',
    offer: 'bg-emerald-500', accepted: 'bg-green-500', rejected: 'bg-red-400', ghosted: 'bg-gray-400', withdrawn: 'bg-orange-400',
  }

  const earliest = toDate(active.reduce((a, b) => {
    const da = toDate(a.applicationDate), db = toDate(b.applicationDate)
    return da < db ? a : b
  }).applicationDate)
  const latest = new Date()

  const totalDays = Math.max(1, (latest - earliest) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Application Timeline</h3>
      <div className="space-y-1.5">
        {active.map((app) => {
          const start = toDate(app.applicationDate)
          if (!start) return null
          const daysSinceStart = Math.max(0, (latest - start) / (1000 * 60 * 60 * 24))
          const pct = Math.min(100, (daysSinceStart / totalDays) * 100)
          const barSegments = app.statusHistory
            ?.filter((h) => statusOrder.indexOf(h.status) >= 0 && h.status !== app.status)
            .map((h) => ({
              status: h.status,
              pct: h.changedAt ? Math.min(100, ((toDate(h.changedAt) - start) / (1000 * 60 * 60 * 24) / totalDays) * 100) : 0,
            })) || []

          return (
            <div key={app.id} onClick={() => navigate(`/applications/${app.id}`)} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1.5 transition-colors group">
              <div className="w-28 flex-shrink-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{app.companyName}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{app.position}</p>
              </div>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                {barSegments.map((seg, i) => (
                  <div key={i} className={`absolute top-0 bottom-0 ${statusColors[seg.status] || 'bg-gray-400'}`} style={{ left: `${barSegments[i - 1]?.pct || 0}%`, width: `${Math.max(2, seg.pct - (barSegments[i - 1]?.pct || 0))}%` }} />
                ))}
                <div className={`absolute top-0 bottom-0 rounded-full ${statusColors[app.status] || 'bg-indigo-500'}`} style={{ left: `${barSegments.length ? barSegments[barSegments.length - 1].pct : 0}%`, width: `${Math.max(4, pct - (barSegments.length ? barSegments[barSegments.length - 1].pct : 0))}%` }} />
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[app.status]} text-white`}>{app.status}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
