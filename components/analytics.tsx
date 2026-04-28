'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'

export function Analytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const check = () => {
      setHasConsent(localStorage.getItem('cookie-consent') === 'accepted')
    }
    check()
    window.addEventListener('cookie-consent-change', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('cookie-consent-change', check)
      window.removeEventListener('storage', check)
    }
  }, [])

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!hasConsent || !gaId) return null

  return <GoogleAnalytics gaId={gaId} />
}
