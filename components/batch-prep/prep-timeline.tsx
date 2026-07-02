'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { PrepStep } from '@/lib/types/batch-prep'

interface Props {
  planId: string
  steps: PrepStep[]
  totalContainers?: number
}

export function PrepTimeline({ planId, steps, totalContainers }: Props) {
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

  const allDone = steps.length > 0 && steps.every((s) => checked[s.step])

  return (
    <>
    {allDone && (
      <div className="rounded-2xl border-2 border-primary bg-primary/10 p-6 text-center animate-in zoom-in-95 fade-in duration-500">
        <p className="text-3xl mb-2">🏁</p>
        <p className="text-xl font-bold text-foreground">
          Prep done{totalContainers ? ` — ${totalContainers} containers ready` : ''}.
        </p>
        <p className="text-muted-foreground mt-1">
          The hard part of your week is already over. Everything else is just opening a lid.
        </p>
      </div>
    )}
    <ol className="space-y-3">
      {steps.map((step) => {
        const isChecked = !!checked[step.step]
        return (
          <li
            key={step.step}
            className={`flex gap-4 rounded-2xl bg-card shadow-sm border border-border-strong p-4 transition-opacity ${isChecked ? 'opacity-50' : ''}`}
          >
            <Checkbox
              id={`prep-step-${step.step}`}
              checked={isChecked}
              onCheckedChange={() => toggle(step.step)}
              className="mt-1"
            />
            <label htmlFor={`prep-step-${step.step}`} className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{step.time}</span>
                <Badge variant="tag" className="uppercase text-[10px]">
                  {equipmentLabel[step.equipment]}
                </Badge>
                {step.duration_mins > 0 && <span>{step.duration_mins} min</span>}
              </div>
              <p className={`mt-1 text-foreground ${isChecked ? 'line-through' : ''}`}>{step.action}</p>
            </label>
          </li>
        )
      })}
    </ol>
    </>
  )
}
