import { useEffect, useRef } from 'react'

export function useFollowUpNotifications(apps) {
  const notifiedRef = useRef(new Set())

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!apps.length) return
    if (Notification.permission !== 'granted') return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    for (const app of apps) {
      if (!app.followUpDate) continue
      const fd = app.followUpDate.toDate ? app.followUpDate.toDate() : new Date(app.followUpDate)
      if (fd >= today && fd < tomorrow && !notifiedRef.current.has(app.id)) {
        notifiedRef.current.add(app.id)
        new Notification(`Follow-up: ${app.companyName}`, {
          body: `${app.position} — Don't forget to follow up today!`,
          icon: '/pwa-192x192.png',
        })
      }
    }
  }, [apps])
}
