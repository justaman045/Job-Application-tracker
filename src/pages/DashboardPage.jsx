import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Phone, CheckCircle, TrendingUp, Clock, Target, Activity, BarChart3 } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { StatCard } from '../components/dashboard/StatCard'
import { StatusPieChart } from '../components/dashboard/StatusPieChart'
import { AppsOverTimeChart } from '../components/dashboard/AppsOverTimeChart'
import { PipelineVelocityChart } from '../components/dashboard/PipelineVelocityChart'
import { FunnelChart } from '../components/dashboard/FunnelChart'
import { RecentApps } from '../components/dashboard/RecentApps'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { FollowUpReminders } from '../components/dashboard/FollowUpReminders'
import { GoalTracker } from '../components/dashboard/GoalTracker'
import { ApplicationTimeline } from '../components/dashboard/ApplicationTimeline'
import { StuckApps } from '../components/dashboard/StuckApps'
import { VelocityMetrics } from '../components/dashboard/VelocityMetrics'
import { DashboardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { EmptyState } from '../components/shared/EmptyState'

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  return new Date(val)
}

function computeTrend(apps, field) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const recent = apps.filter((a) => {
    const d = toDate(a.applicationDate)
    return d && d >= thirtyDaysAgo && d <= now
  })

  const previous = apps.filter((a) => {
    const d = toDate(a.applicationDate)
    return d && d >= sixtyDaysAgo && d < thirtyDaysAgo
  })

  if (field === 'total') {
    const diff = recent.length - previous.length
    if (!previous.length) return recent.length > 0 ? { direction: 'up', label: `+${recent.length} this month` } : null
    const pct = Math.round((diff / previous.length) * 100)
    return { direction: diff >= 0 ? 'up' : 'down', label: `${diff >= 0 ? '+' : ''}${pct}% vs last month` }
  }

  if (field === 'interviews') {
    const r = recent.filter((a) => a.status === 'interview').length
    const p = previous.filter((a) => a.status === 'interview').length
    const diff = r - p
    if (!p) return r > 0 ? { direction: 'up', label: `+${r} this month` } : null
    const pct = Math.round((diff / p) * 100)
    return { direction: diff >= 0 ? 'up' : 'down', label: `${diff >= 0 ? '+' : ''}${pct}% vs last month` }
  }

  if (field === 'offers') {
    const r = recent.filter((a) => a.status === 'offer' || a.status === 'accepted').length
    const p = previous.filter((a) => a.status === 'offer' || a.status === 'accepted').length
    const diff = r - p
    if (!p) return r > 0 ? { direction: 'up', label: `+${r} this month` } : null
    const pct = Math.round((diff / p) * 100)
    return { direction: diff >= 0 ? 'up' : 'down', label: `${diff >= 0 ? '+' : ''}${pct}% vs last month` }
  }

  return null
}

export function DashboardPage() {
  const { apps, loading, error, getStats } = useApplications()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    if (!apps.length) return null
    return getStats()
  }, [apps, getStats])

  const trends = useMemo(() => {
    if (!apps.length) return {}
    return {
      total: computeTrend(apps, 'total'),
      interviews: computeTrend(apps, 'interviews'),
      offers: computeTrend(apps, 'offers'),
    }
  }, [apps])

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorDisplay message={error} />

  if (!apps.length) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        <EmptyState icon="file" title="Welcome to North!" message="Start by adding your first job application to see your stats here. Track applications, interviews, offers, and more." actionLabel="Add Your First Application" actionTo="/applications/new" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your job search at a glance</p>
        </div>
        <button
          onClick={() => navigate('/applications/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
        >
          <Send className="w-4 h-4" /> Add Application
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Send} label="Total Applications" value={stats.total} gradient="from-indigo-500 to-indigo-600" trend={trends.total} />
        <StatCard icon={Activity} label="Active" value={stats.active} gradient="from-cyan-500 to-cyan-600" />
        <StatCard icon={Phone} label="Interviews" value={stats.interviews} gradient="from-violet-500 to-violet-600" trend={trends.interviews} />
        <StatCard icon={CheckCircle} label="Offers" value={stats.offers} gradient="from-emerald-500 to-emerald-600" trend={trends.offers} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Response Rate" value={`${stats.responseRate}%`} subtext="Companies that responded" />
        <StatCard icon={Target} label="Interview Rate" value={`${stats.interviewRate}%`} subtext="Apps that led to interviews" />
        <StatCard icon={CheckCircle} label="Offer Rate" value={`${stats.offerRate}%`} subtext="Apps that led to offers" />
        <StatCard icon={Clock} label="Avg Response" value={stats.avgResponseDays ? `${stats.avgResponseDays}d` : '—'} subtext="Days to first response" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalTracker apps={apps} />
        <div className="lg:col-span-2">
          <FollowUpReminders apps={apps} />
        </div>
      </div>

      <StuckApps apps={apps} />

      <VelocityMetrics apps={apps} />

      {(() => {
        const now = new Date()
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const weekApps = apps.filter(a => { const d = toDate(a.applicationDate); return d && d >= weekStart })
        const monthApps = apps.filter(a => { const d = toDate(a.applicationDate); return d && d >= monthStart })
        const weekInterviews = weekApps.filter(a => a.status === 'interview' || a.interviewRounds?.length > 0).length
        const monthOffers = monthApps.filter(a => a.status === 'offer' || a.status === 'accepted').length
        const topSource = Object.entries(stats.sourceEffectiveness).sort((a, b) => b[1].total - a[1].total)[0]
        if (weekApps.length > 0 || monthApps.length > 0) {
          return (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Job Search Report</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This week: <strong>{weekApps.length}</strong> app{weekApps.length !== 1 ? 's' : ''}, <strong>{weekInterviews}</strong> interview{weekInterviews !== 1 ? 's' : ''}.
                This month: <strong>{monthApps.length}</strong> app{monthApps.length !== 1 ? 's' : ''}, <strong>{monthOffers}</strong> offer{monthOffers !== 1 ? 's' : ''}.
                {topSource && topSource[1].total > 0 && <span> Best source: <strong className="capitalize">{topSource[0].replace('_', ' ')}</strong> ({topSource[1].total} apps).</span>}
                {stats.avgResponseDays && <span> Avg response time: <strong>{stats.avgResponseDays}d</strong>.</span>}
              </p>
            </div>
          )
        }
        return null
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Application Funnel</h3>
          <FunnelChart apps={apps} stats={stats} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h3>
          <StatusPieChart data={stats.statusCounts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Applications Over Time</h3>
          <AppsOverTimeChart data={stats.weeklyData} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Pipeline Velocity (Avg Days per Stage)</h3>
          <PipelineVelocityChart data={stats.pipelineVelocity} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Source Effectiveness</h3>
          {Object.keys(stats.sourceEffectiveness).length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(stats.sourceEffectiveness).map(([source, data]) => (
                <div key={source} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{source.replace('_', ' ')}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{data.total} apps</span>
                    <span className="text-violet-500">{Math.round((data.interviews / data.total) * 100)}% interview</span>
                    <span className="text-emerald-500">{Math.round((data.offers / data.total) * 100)}% offer</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Add applications to see source effectiveness</p>
          )}
        </div>
        <ApplicationTimeline apps={apps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Rejection Reasons</h3>
          {Object.keys(stats.rejectionReasons || {}).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.rejectionReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{reason}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-red-100 dark:bg-red-900/30 rounded-full" style={{ width: `${Math.min(100, (count / stats.rejected) * 100)}px` }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No rejection reasons recorded yet</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Applications</h3>
          <RecentApps apps={apps} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity Feed</h3>
        <ActivityFeed events={stats.activityFeed} />
      </div>
    </div>
  )
}
