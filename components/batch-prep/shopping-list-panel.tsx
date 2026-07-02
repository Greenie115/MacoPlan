'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type { ShoppingItem } from '@/lib/types/batch-prep'

export function ShoppingListPanel({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const key = item.category ?? 'other'
    ;(acc[key] ||= []).push(item)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="rounded-2xl bg-card shadow-sm border border-border-strong p-4">
          <h3 className="font-bold uppercase text-xs tracking-wide text-muted-foreground mb-3">
            {category}
          </h3>
          <ul className="space-y-2.5">
            {categoryItems.map((item, idx) => {
              const globalIdx = items.indexOf(item)
              const isChecked = !!checked[globalIdx]
              return (
                <li key={idx} className="flex items-center gap-3">
                  <Checkbox
                    id={`shopping-item-${globalIdx}`}
                    checked={isChecked}
                    onCheckedChange={(value) =>
                      setChecked({ ...checked, [globalIdx]: value === true })
                    }
                  />
                  <label
                    htmlFor={`shopping-item-${globalIdx}`}
                    className={
                      isChecked
                        ? 'line-through text-muted-foreground cursor-pointer'
                        : 'text-foreground cursor-pointer'
                    }
                  >
                    {item.quantity_g}g {item.ingredient}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
