'use client'

import Link from 'next/link'
import { sendGAEvent } from '@next/third-parties/google'
import type { ComponentProps } from 'react'

// Link that reports a GA4 `cta_click` event. sendGAEvent is a no-op until GA
// has loaded (i.e. after cookie consent), so this stays consent-safe.
export function TrackedLink({ event, ...props }: ComponentProps<typeof Link> & { event: Record<string, string> }) {
  return <Link {...props} onClick={() => sendGAEvent('event', 'cta_click', event)} />
}
