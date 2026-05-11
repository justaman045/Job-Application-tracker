import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="text-8xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent mb-4">404</div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Page not found</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
      >
        <Home className="w-4 h-4" /> Go Home
      </Link>
    </div>
  )
}
