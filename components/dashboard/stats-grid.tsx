'use client'

import { StatsCard } from './stats-card'
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react'

interface StatsGridProps {
  currentStreak: number
  daysLoggedThisWeek: number
  totalDaysThisWeek?: number
  macroAccuracy: number // 0-100 percentage
  plansCreated: number
  monthlyTrend?: number
}

export function StatsGrid({
  currentStreak,
  daysLoggedThisWeek,
  totalDaysThisWeek = 7,
  macroAccuracy,
  plansCreated,
  monthlyTrend,
}: StatsGridProps) {
  // Calculate variant for macro accuracy
  const accuracyVariant =
    macroAccuracy >= 90 ? 'success' : macroAccuracy >= 75 ? 'warning' : 'danger'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6 px-4 md:px-6 lg:px-8">
      {/* Current Streak */}
      <StatsCard
        icon={Flame}
        label="Current Streak"
        value={`${currentStreak} days`}
        variant={currentStreak >= 7 ? 'success' : 'default'}
      />

      {/* This Week */}
      <StatsCard
        icon={Calendar}
        label="This Week"
        value={`${daysLoggedThisWeek}/${totalDaysThisWeek}`}
        trend={{
          value: Math.round((daysLoggedThisWeek / totalDaysThisWeek) * 100),
          label: 'complete',
          isPositive: daysLoggedThisWeek >= 5,
        }}
        variant={daysLoggedThisWeek >= 5 ? 'success' : 'default'}
      />

      {/* Macro Accuracy */}
      <StatsCard
        icon={Target}
        label="Macro Accuracy"
        value={`${macroAccuracy}%`}
        variant={accuracyVariant}
      />

      {/* Total Plans */}
      <StatsCard
        icon={TrendingUp}
        label="Total Plans"
        value={plansCreated}
        trend={
          monthlyTrend
            ? {
                value: monthlyTrend,
                label: 'this month',
                isPositive: monthlyTrend > 0,
              }
            : undefined
        }
      />
    </div>
  )
}
