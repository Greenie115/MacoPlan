'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  step: number
}

// Mirrors --ease-out-quint from app/globals.css — tokenized, no bounce.
const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function PageTransition({ children, step }: PageTransitionProps) {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [prevStep, setPrevStep] = useState(step)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (step > prevStep) {
      setDirection('forward')
    } else if (step < prevStep) {
      setDirection('backward')
    }
    setPrevStep(step)
  }, [step, prevStep])

  // State-only slide (24px, not a full-screen sweep) that signals direction
  // without marketing-scale choreography. Reduced motion drops to a crossfade.
  const variants = {
    initial: (direction: 'forward' | 'backward') =>
      reduceMotion
        ? { opacity: 0 }
        : { x: direction === 'forward' ? 24 : -24, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: (direction: 'forward' | 'backward') =>
      reduceMotion
        ? { opacity: 0 }
        : { x: direction === 'forward' ? -24 : 24, opacity: 0 },
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: reduceMotion ? 0.15 : 0.22,
            ease: EASE_OUT_QUINT,
          }}
          style={{
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            willChange: 'transform, opacity',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
