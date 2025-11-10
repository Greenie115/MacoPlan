'use client'

import { Card } from '@/components/ui/card'

interface StatsGridProps {
  plansCreated: number
  mealsLogged: number
}

export function StatsGrid({ plansCreated, mealsLogged }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 md:px-6 lg:px-8">
      {/* Plans Created */}
      <Card className="p-4 border border-border">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-charcoal">
            {plansCreated.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Plans Created</p>
        </div>
      </Card>

      {/* Meals Logged */}
      <Card className="p-4 border border-border">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-charcoal">
            {mealsLogged.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Meals Logged</p>
        </div>
      </Card>
    </div>
  )
}
