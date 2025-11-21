'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Recipe page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong!
        </h1>
        <p className="text-gray-600">
          We couldn't load the recipes. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
