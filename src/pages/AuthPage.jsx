import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { GoogleSignIn } from '../components/auth/GoogleSignIn'
import { useState } from 'react'
import { Spinner } from '../components/shared/Loading'

export function AuthPage() {
  const { user, loading: authLoading, signInWithGoogle, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, from])

  if (authLoading) return <Spinner className="min-h-screen" size="lg" />
  if (user) return null

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    clearError()
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">North</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Track your job applications with style</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          <GoogleSignIn onClick={handleGoogleSignIn} loading={signingIn} />
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
            By signing in, you agree to store your application data securely.
          </p>
        </div>
      </div>
    </div>
  )
}
