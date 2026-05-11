import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useFollowUpNotifications } from '../../hooks/useFollowUpNotifications'
import { useApplications } from '../../hooks/useApplications'
import { ShortcutsModal } from '../shared/ShortcutsModal'
import { QuickAddFAB } from '../shared/QuickAddFAB'
import { ConnectivityBanner } from '../shared/ConnectivityBanner'
import { useState, useRef } from 'react'
import { Plus, LayoutDashboard, Briefcase, Columns3, GitCompare, CalendarDays } from 'lucide-react'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/kanban', label: 'Kanban', icon: Columns3 },
  { to: '/offers', label: 'Offers', icon: GitCompare },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export function Layout() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const searchRef = useRef(null)
  const { apps } = useApplications()
  const location = useLocation()
  const navigate = useNavigate()

  useKeyboardShortcuts(searchRef, () => setShortcutsOpen(true))
  useFollowUpNotifications(apps)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <ConnectivityBanner />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        <Outlet context={{ searchRef }} />
      </main>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <QuickAddFAB />

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 py-1">
          {navLinks.map((link) => {
            const active = location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
          <button
            onClick={() => navigate('/applications/new')}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center -mt-1 shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            New
          </button>
        </div>
      </div>
    </div>
  )
}
