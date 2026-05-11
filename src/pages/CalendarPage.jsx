import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, Phone, CalendarDays } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { StatusBadge } from '../components/shared/StatusBadge'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  if (typeof val === 'string') return parseISO(val)
  return new Date(val)
}

export function CalendarPage() {
  const navigate = useNavigate()
  const { apps, loading, error } = useApplications()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const events = useMemo(() => {
    const items = []
    for (const app of apps) {
      const appDate = toDate(app.applicationDate)
      if (appDate) items.push({ date: appDate, app, type: 'applied' })
      const followUp = toDate(app.followUpDate)
      if (followUp) items.push({ date: followUp, app, type: 'follow-up' })
      for (const round of (app.interviewRounds || [])) {
        const roundDate = round.date ? parseISO(round.date) : null
        if (roundDate) items.push({ date: roundDate, app, type: 'interview', roundName: round.roundName })
      }
    }
    return items
  }, [apps])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return events
      .filter((e) => isSameDay(e.date, selectedDate))
      .sort((a, b) => a.date - b.date)
  }, [events, selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const getDayEvents = (d) => events.filter((e) => isSameDay(e.date, d))

  if (loading) return <CardSkeleton count={6} />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Interviews, follow-ups, and application dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-gray-50 dark:bg-gray-800 px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              const dayEvents = getDayEvents(d)
              const isCurrentMonth = isSameMonth(d, currentMonth)
              const isSelected = selectedDate && isSameDay(d, selectedDate)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`min-h-[80px] p-1.5 text-left transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
                  } ${
                    isSelected ? 'ring-2 ring-indigo-500 z-10' : ''
                  } hover:bg-gray-50 dark:hover:bg-gray-800`}
                >
                  <span className={`text-xs font-medium ${
                    isToday(d) ? 'inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full' :
                    isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {format(d, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div key={j} className={`h-1.5 rounded-full ${
                        e.type === 'interview' ? 'bg-violet-400' :
                        e.type === 'follow-up' ? 'bg-amber-400' : 'bg-indigo-400'
                      }`} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-gray-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedEvents.map((event, i) => (
                <button key={i} onClick={() => navigate(`/applications/${event.app.id}`)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    {event.type === 'interview' ? <Phone className="w-3.5 h-3.5 text-violet-500" /> :
                     event.type === 'follow-up' ? <Clock className="w-3.5 h-3.5 text-amber-500" /> :
                     <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />}
                    <span className="text-xs font-medium text-gray-500 capitalize">{event.type}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.app.companyName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.app.position}{event.roundName ? ` — ${event.roundName}` : ''}</p>
                  <div className="mt-1">
                    <StatusBadge status={event.app.status} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {selectedDate ? 'No events on this date' : 'Click a date to see events'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
