'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Checkout error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Checkout hit a snag</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t complete that step. No charge has been made — you can try again or
          return to pricing.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border-strong font-semibold hover:bg-muted transition-colors"
          >
            Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
