import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ icon: Icon, label, value, subtext, gradient, trend }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
          {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.label}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient || 'from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30'} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-white' : 'text-indigo-500'}`} />
        </div>
      </div>
    </div>
  )
}
