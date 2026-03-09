'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-[slideUp_0.4s_ease-out]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card/80 backdrop-blur-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              We use cookies
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies for authentication and to improve your experience.
              Read our{' '}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Privacy Policy
              </Link>{' '}
              for more details.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="secondary" size="sm" onClick={handleReject}>
              Reject Non-Essential
            </Button>
            <Button variant="default" size="sm" onClick={handleAccept}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
