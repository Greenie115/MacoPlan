'use client'

import { useState } from 'react'
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
        <div key={category}>
          <h3 className="font-semibold uppercase text-sm text-muted-foreground mb-2">
            {category}
          </h3>
          <ul className="space-y-1">
            {categoryItems.map((item, idx) => {
              const globalIdx = items.indexOf(item)
              return (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!checked[globalIdx]}
                    onChange={(e) =>
                      setChecked({ ...checked, [globalIdx]: e.target.checked })
                    }
                  />
                  <span className={checked[globalIdx] ? 'line-through text-muted-foreground' : ''}>
                    {item.quantity_g}g {item.ingredient}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
