import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner } from '../shared/Loading'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner className="min-h-[60vh]" size="lg" />
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />

  return children
}
