import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OnboardingWizard } from './components/shared/OnboardingWizard'

const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })))
const ApplicationFormPage = lazy(() => import('./pages/ApplicationFormPage').then(m => ({ default: m.ApplicationFormPage })))
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage').then(m => ({ default: m.ApplicationDetailPage })))
const KanbanBoardPage = lazy(() => import('./pages/KanbanBoardPage').then(m => ({ default: m.KanbanBoardPage })))
const OfferComparisonPage = lazy(() => import('./pages/OfferComparisonPage').then(m => ({ default: m.OfferComparisonPage })))
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const ExportImportPage = lazy(() => import('./pages/ExportImportPage').then(m => ({ default: m.ExportImportPage })))
const BookmarkletPage = lazy(() => import('./pages/BookmarkletPage').then(m => ({ default: m.BookmarkletPage })))
const ProspectsPage = lazy(() => import('./pages/ProspectsPage').then(m => ({ default: m.ProspectsPage })))
const SalariesPage = lazy(() => import('./pages/SalariesPage').then(m => ({ default: m.SalariesPage })))
const InterviewsPage = lazy(() => import('./pages/InterviewsPage').then(m => ({ default: m.InterviewsPage })))
const ShareHandlerPage = lazy(() => import('./pages/ShareHandlerPage').then(m => ({ default: m.ShareHandlerPage })))

function ErrorBoundaryFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">An unexpected error occurred. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <ErrorBoundaryFallback />
    return this.props.children
  }
}

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem('north-onboarded')
    if (!onboarded) {
      const timer = setTimeout(() => setShowOnboarding(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/bookmarklet" element={<BookmarkletPage />} />
          <Route path="/share" element={<ShareHandlerPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/new" element={<ApplicationFormPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/applications/:id/edit" element={<ApplicationFormPage />} />
            <Route path="/kanban" element={<KanbanBoardPage />} />
            <Route path="/offers" element={<OfferComparisonPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/export" element={<ExportImportPage />} />
            <Route path="/prospects" element={<ProspectsPage />} />
            <Route path="/salaries" element={<SalariesPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <OnboardingWizard open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
