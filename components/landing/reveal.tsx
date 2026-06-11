'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in seconds, e.g. for cards in a grid. */
  delay?: number
  className?: string
}

/**
 * Subtle scroll-reveal wrapper. Fades + lifts children into view once.
 * Respects prefers-reduced-motion (renders static, no transform).
 *
 * Carries the `reveal-fallback` class until hydration completes so content
 * still becomes visible if JS never runs (see globals.css).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={hydrated ? className : [className, 'reveal-fallback'].filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
