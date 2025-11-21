'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

export function UpgradeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="px-4 py-2">
      <div className="relative flex flex-1 flex-col items-start justify-between gap-3 rounded-xl bg-orange-50 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="text-gray-900 text-sm font-semibold leading-tight">
            Free: 100 recipes available
          </p>
        </div>
        <a
          className="text-sm font-semibold leading-normal tracking-[0.015em] flex gap-1 text-primary items-center hover:underline"
          href="#"
        >
          Upgrade for full access →
        </a>
        <button
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
