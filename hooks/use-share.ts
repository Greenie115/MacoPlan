'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ShareOptions {
  title: string
  text: string
}

/**
 * Hook for sharing content using Web Share API with clipboard fallback
 *
 * On mobile/modern browsers: Uses native share menu
 * On desktop/older browsers: Falls back to copying to clipboard
 */
export function useShare() {
  const [isSharing, setIsSharing] = useState(false)

  const share = async ({ title, text }: ShareOptions) => {
    setIsSharing(true)

    try {
      if (navigator.share) {
        // Use native Web Share API (mobile and modern browsers)
        await navigator.share({ title, text })
        toast.success('Shared successfully!')
      } else {
        // Fallback: Copy to clipboard (desktop/older browsers)
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Share error:', error)
        toast.error('Failed to share. Please try again.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  return { share, isSharing }
}
