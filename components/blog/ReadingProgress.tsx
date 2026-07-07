'use client'

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Thin coral progress bar pinned under the fixed header, tracking scroll
 * through the article. Skipped entirely under prefers-reduced-motion since
 * it's a pure motion affordance with no informational content otherwise lost.
 */
export function ReadingProgress() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  if (reduceMotion) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-16 z-40 h-0.5 origin-left bg-coral-500"
      style={{ scaleX }}
    />
  )
}
