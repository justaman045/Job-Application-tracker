import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckSquare, ExternalLink } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { EmptyState } from '../components/shared/EmptyState'
import { format } from 'date-fns'

const PREP_STORAGE_KEY = 'north-interview-prep'

function loadPrep() {
  try { return JSON.parse(localStorage.getItem(PREP_STORAGE_KEY) || '{}') } catch { return {} }
}

function savePrep(data) {
  localStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(data))
}

const DEFAULT_CHECKS = [
  { key: 'research', label: 'Research company (products, culture, news)' },
  { key: 'review_jd', label: 'Review job description' },
  { key: 'prepare_questions', label: 'Prepare questions for interviewer' },
  { key: 'practice_stories', label: 'Practice STAR stories' },
  { key: 'setup_env', label: 'Setup environment (quiet space, camera, mic)' },
  { key: 'review_salary', label: 'Review salary expectations' },
]

export function InterviewsPage() {
  const navigate = useNavigate()
  const { apps, loading, error } = useApplications()
  const [prep, setPrep] = useState(() => loadPrep())

  useEffect(() => { savePrep(prep) }, [prep])

  const upcoming = useMemo(() => {
    const now = new Date()
    return apps.filter((a) => {
      if (a.archived) return false
      if (a.status !== 'interview') return false
      const hasUpcoming = (a.interviewRounds || []).some((r) => r.date && new Date(r.date) >= now)
      return hasUpcoming
    }).sort((a, b) => {
      const aDate = Math.min(...(a.interviewRounds || []).map((r) => r.date ? new Date(r.date).getTime() : Infinity))
      const bDate = Math.min(...(b.interviewRounds || []).map((r) => r.date ? new Date(r.date).getTime() : Infinity))
      return aDate - bDate
    })
  }, [apps])

  const history = useMemo(() => {
    return apps.filter((a) => {
      if (a.archived) return false
      if (a.status !== 'interview') return false
      return !(a.interviewRounds || []).some((r) => r.date && new Date(r.date) >= new Date())
    })
  }, [apps])

  const getNextRound = (app) => {
    return (app.interviewRounds || []).filter((r) => r.date && new Date(r.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null
  }

  const getCountdown = (date) => {
    const diff = new Date(date) - new Date()
    if (diff < 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const toggleCheck = (appId, key) => {
    setPrep((prev) => {
      const appPrep = { ...(prev[appId] || {}) }
      appPrep[key] = !appPrep[key]
      return { ...prev, [appId]: appPrep }
    })
  }

  if (loading) return <CardSkeleton count={4} />
  if (error) return <ErrorDisplay message={error} />

  if (upcoming.length === 0 && history.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Interview Prep</h1>
        <EmptyState icon="file" title="No interviews yet" message="When you have upcoming interviews, they will appear here with preparation checklists." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Prep</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{upcoming.length} upcoming, {history.length} past interviews</p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((app) => {
              const nextRound = getNextRound(app)
              const appPrep = prep[app.id] || {}
              const doneCount = Object.values(appPrep).filter(Boolean).length
              return (
                <div key={app.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{app.companyName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.position}</p>
                    </div>
                    {nextRound?.date && (() => {
                      const countdown = getCountdown(nextRound.date)
                      return countdown ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full whitespace-nowrap">
                          <Clock className="w-3 h-3" /> {countdown}
                        </div>
                      ) : null
                    })()}
                  </div>

                  {nextRound && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="w-3 h-3" />
                      {nextRound.roundName && <span className="font-medium text-gray-700 dark:text-gray-300">{nextRound.roundName} — </span>}
                      {format(new Date(nextRound.date), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Prep checklist ({doneCount}/{DEFAULT_CHECKS.length})</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {DEFAULT_CHECKS.map((check) => (
                      <label key={check.key} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={appPrep[check.key] || false}
                          onChange={() => toggleCheck(app.id, check.key)}
                          className="rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500 w-3 h-3"
                        />
                        <span className={`text-xs ${appPrep[check.key] ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-400'} group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors`}>
                          {check.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {app.jobPostingUrl && (
                      <a href={app.jobPostingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600">
                        <ExternalLink className="w-3 h-3" /> Job Posting
                      </a>
                    )}
                    <button onClick={() => navigate(`/applications/${app.id}`)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto">
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Past / In Progress</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((app) => (
                <div key={app.id} onClick={() => navigate(`/applications/${app.id}`)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{app.companyName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{app.position} — {(app.interviewRounds || []).length} round{(app.interviewRounds || []).length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.jobPostingUrl && (
                      <a href={app.jobPostingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
