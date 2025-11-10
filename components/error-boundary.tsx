'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={reset}>Try Again</Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/onboarding/1'}
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
