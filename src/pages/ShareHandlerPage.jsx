import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader } from 'lucide-react'

export function ShareHandlerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const name = searchParams.get('name') || ''
    const description = searchParams.get('description') || ''
    const link = searchParams.get('link') || ''

    const params = new URLSearchParams()
    if (link) params.set('jobPostingUrl', link)
    if (name) params.set('companyName', name.replace(/^job\s+(at\s+)?/i, '').trim())
    if (description && !name) {
      params.set('notes', description)
    }

    navigate(`/applications/new?${params.toString()}`, { replace: true })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Processing shared content...</p>
      </div>
    </div>
  )
}
