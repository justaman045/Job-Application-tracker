/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../lib/firebase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.')
      } else {
        setError(err.message)
      }
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}
