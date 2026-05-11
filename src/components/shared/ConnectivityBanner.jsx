import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function ConnectivityBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="bg-amber-500 text-white text-center text-sm py-1.5 px-4 flex items-center justify-center gap-2 font-medium">
      <WifiOff className="w-4 h-4" />
      You are offline. Data will sync when you reconnect.
    </div>
  )
}
