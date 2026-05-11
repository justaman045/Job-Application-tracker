import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts(searchRef, onOpenShortcuts, tableNavEnabled = true) {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          e.target.blur()
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          const form = e.target.closest('form')
          if (form) {
            const submitBtn = form.querySelector('button[type="submit"]')
            submitBtn?.click()
          }
        }
        return
      }

      switch (e.key) {
        case 'n':
        case 'N':
          navigate('/applications/new')
          break
        case '/':
          e.preventDefault()
          searchRef?.current?.focus()
          break
        case '?':
          e.preventDefault()
          onOpenShortcuts?.()
          break
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) break
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('north:toggle-quickadd'))
          break
        case 'Escape':
          document.querySelectorAll('[role="dialog"]').forEach((el) => {
            const closeBtn = el.querySelector('[data-close-dialog]')
            if (closeBtn) closeBtn.click()
          })
          break
        case 'j':
        case 'J':
          if (!tableNavEnabled) break
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('north:navigate-table', { detail: { direction: 'next' } }))
          break
        case 'k':
        case 'K':
          if (!tableNavEnabled) break
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('north:navigate-table', { detail: { direction: 'prev' } }))
          break
        case 'Enter':
          if (tableNavEnabled) {
            window.dispatchEvent(new CustomEvent('north:open-selected'))
          }
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, searchRef, onOpenShortcuts, tableNavEnabled])
}
