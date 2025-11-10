'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  step: number
}

export function PageTransition({ children, step }: PageTransitionProps) {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [prevStep, setPrevStep] = useState(step)

  useEffect(() => {
    if (step > prevStep) {
      setDirection('forward')
    } else if (step < prevStep) {
      setDirection('backward')
    }
    setPrevStep(step)
  }, [step, prevStep])

  // Animation variants
  const variants = {
    initial: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
    }),
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
            duration: 0.3,
            ease: 'easeInOut',
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
