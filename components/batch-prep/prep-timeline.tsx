'use client'

import { useEffect, useState } from 'react'
import type { PrepStep } from '@/lib/types/batch-prep'

interface Props {
  planId: string
  steps: PrepStep[]
}

export function PrepTimeline({ planId, steps }: Props) {
  const storageKey = `prep-timeline:${planId}`
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setChecked(JSON.parse(stored))
      } catch {
        // ignore corrupt state
      }
    }
  }, [storageKey])

  const toggle = (stepNum: number) => {
    setChecked((prev) => {
      const next = { ...prev, [stepNum]: !prev[stepNum] }
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(next))
      }
      return next
    })
  }

  const equipmentLabel: Record<string, string> = {
    oven: 'Oven',
    rice_cooker: 'Rice cooker',
    stovetop: 'Stovetop',
    none: 'Prep',
  }

  return (
    <ol className="space-y-4">
      {steps.map((step) => {
        const isChecked = !!checked[step.step]
        return (
          <li
            key={step.step}
            className={`flex gap-4 p-4 border rounded ${isChecked ? 'opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(step.step)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{step.time}</span>
                <span className="px-2 py-0.5 bg-muted rounded uppercase text-[10px]">
                  {equipmentLabel[step.equipment]}
                </span>
                {step.duration_mins > 0 && <span>{step.duration_mins} min</span>}
              </div>
              <p className={`mt-1 ${isChecked ? 'line-through' : ''}`}>{step.action}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
