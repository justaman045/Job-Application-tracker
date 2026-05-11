export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-gray-200 dark:border-gray-700 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  )
}

function SkeletonBar({ className = '' }) {
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBar className="h-8 w-48 mb-2" />
          <SkeletonBar className="h-4 w-36" />
        </div>
        <SkeletonBar className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function ApplicationsSkeleton() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-10 w-40 rounded-lg" />
      </div>
      <SkeletonBar className="h-10 w-full rounded-lg" />
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-2 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <SkeletonBar className="h-5 w-16" />
      <div className="flex items-start justify-between">
        <div>
          <SkeletonBar className="h-8 w-64 mb-2" />
          <SkeletonBar className="h-5 w-48" />
        </div>
        <SkeletonBar className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <SkeletonBar className="h-5 w-16" />
      <SkeletonBar className="h-8 w-48" />
      <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}
