# Dashboard Improvement Implementation Specification

**Version:** 1.0
**Date:** 2025-11-11
**Priority:** CRITICAL & HIGH items only (for initial implementation)
**Target:** feature/dashboard-home-screen branch

This document provides detailed technical specifications for implementing the critical improvements identified in `DASHBOARD_UX_DESIGN_REVIEW.md`.

---

## Table of Contents
1. [Design System Foundation](#1-design-system-foundation)
2. [Macro Target Card Redesign](#2-macro-target-card-redesign-critical)
3. [Recent Plans Carousel Improvements](#3-recent-plans-carousel-improvements-critical)
4. [Stats Grid Redesign](#4-stats-grid-redesign-high)
5. [Generate Plan CTA Refinement](#5-generate-plan-cta-refinement-high)
6. [Greeting Header Enhancement](#6-greeting-header-enhancement-high)
7. [Empty States Implementation](#7-empty-states-implementation-critical)
8. [Color System Implementation](#8-color-system-implementation-high)

---

## 1. Design System Foundation

Before implementing component changes, establish the design system tokens.

### 1.1 Create Design Tokens File

**File:** `lib/design-tokens.ts`

```typescript
/**
 * MacroPlan Design System Tokens
 * Centralized design system for consistent theming
 */

// Typography Scale
export const typography = {
  display: 'text-4xl font-bold', // 36px / 40px mobile, 48px desktop
  h1: 'text-3xl font-bold', // 30px / 32px
  h2: 'text-2xl font-bold', // 24px
  h3: 'text-xl font-semibold', // 20px
  body: 'text-base font-normal', // 16px
  bodyMedium: 'text-base font-medium', // 16px
  small: 'text-sm font-normal', // 14px
  smallMedium: 'text-sm font-medium', // 14px
  tiny: 'text-xs font-normal', // 12px
  tinyMedium: 'text-xs font-medium', // 12px
} as const

// Line Heights
export const lineHeight = {
  tight: 'leading-tight', // 1.2 - headings
  normal: 'leading-normal', // 1.5 - body text
  relaxed: 'leading-relaxed', // 1.625 - long-form content
} as const

// Semantic Colors (add to tailwind.config)
export const semanticColors = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    solid: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    solid: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    solid: 'bg-blue-500',
  },
} as const

// Macro Category Colors
export const macroColors = {
  protein: {
    primary: '#3B82F6', // blue-500
    light: '#DBEAFE', // blue-100
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  carbs: {
    primary: '#F59E0B', // amber-500
    light: '#FEF3C7', // amber-100
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  fat: {
    primary: '#EAB308', // yellow-500
    light: '#FEF9C3', // yellow-100
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
} as const

// Spacing Scale (base: 16px)
export const spacing = {
  xs: 'gap-2', // 8px
  sm: 'gap-3', // 12px
  md: 'gap-4', // 16px
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
  '2xl': 'gap-10', // 40px
} as const

// Container Padding (consistent across app)
export const container = {
  padding: 'px-4 sm:px-6 lg:px-8',
  maxWidth: 'max-w-7xl mx-auto',
} as const

// Card Styles
export const card = {
  padding: {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  },
  elevation: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
} as const

// Progress Bar Colors
export const progressColors = {
  onTrack: 'bg-green-500', // 90-110%
  warning: 'bg-amber-500', // 80-90% or 110-120%
  danger: 'bg-red-500', // <80% or >120%
} as const
```

### 1.2 Update Tailwind Config

**File:** `tailwind.config.ts`

Add to `theme.extend`:

```typescript
colors: {
  // ... existing colors
  success: {
    50: '#F0FDF4',
    500: '#10B981',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    700: '#B45309',
  },
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    700: '#1D4ED8',
  },
  // Macro colors
  'macro-protein': '#3B82F6',
  'macro-carbs': '#F59E0B',
  'macro-fat': '#EAB308',
},
```

---

## 2. Macro Target Card Redesign (CRITICAL)

### 2.1 Component Structure Changes

**File:** `components/dashboard/macro-target-card.tsx`

#### New Features to Add:
1. Individual macro progress bars (protein, carbs, fat)
2. Color-coded progress indicators
3. Eaten/target display for each macro
4. "Log Meal" quick action button
5. Meals logged count
6. Dynamic state handling (empty, partial, complete, over)

#### Component Interface (Updated)

```typescript
interface MacroTargetCardProps {
  // Targets
  targetCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number

  // Progress
  caloriesEaten?: number
  proteinEaten?: number
  carbsEaten?: number
  fatEaten?: number

  // Metadata
  mealsLogged?: number
  totalMealsPlanned?: number

  // Actions
  onLogMeal?: () => void
  onViewPlan?: () => void
}
```

#### Implementation Details

**2.1.1 Create MacroProgressBar Component**

**New File:** `components/dashboard/macro-progress-bar.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'
import { macroColors, progressColors } from '@/lib/design-tokens'

interface MacroProgressBarProps {
  type: 'protein' | 'carbs' | 'fat'
  eaten: number
  target: number
  showCalories?: boolean // Show calorie breakdown
}

export function MacroProgressBar({
  type,
  eaten,
  target,
  showCalories = false
}: MacroProgressBarProps) {
  const percentage = target > 0 ? (eaten / target) * 100 : 0
  const remaining = Math.max(0, target - eaten)

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (percentage >= 90 && percentage <= 110) return progressColors.onTrack
    if ((percentage >= 80 && percentage < 90) || (percentage > 110 && percentage <= 120)) {
      return progressColors.warning
    }
    return progressColors.danger
  }

  // Get macro-specific colors
  const colors = macroColors[type]

  // Calculate calories for this macro
  const caloriesPerGram = type === 'fat' ? 9 : 4
  const caloriesEaten = eaten * caloriesPerGram
  const caloriesTarget = target * caloriesPerGram

  return (
    <div className="space-y-2">
      {/* Macro Name & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icon/Emoji */}
          <span className="text-lg">
            {type === 'protein' ? '🥩' : type === 'carbs' ? '🍞' : '🥑'}
          </span>

          {/* Label */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground capitalize">
              {type}
            </p>
            {showCalories && (
              <p className="text-[10px] text-muted-foreground">
                {caloriesEaten}/{caloriesTarget} cal
              </p>
            )}
          </div>
        </div>

        {/* Eaten/Target */}
        <div className="text-right">
          <p className="text-sm font-bold text-charcoal">
            <span className={cn(
              percentage > 100 && 'text-red-600'
            )}>
              {eaten}
            </span>
            <span className="text-muted-foreground">/{target}g</span>
          </p>
          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {remaining}g left
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            getProgressColor()
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Warning text if over */}
      {percentage > 110 && (
        <p className="text-xs text-red-600 font-medium">
          {Math.round(percentage - 100)}% over target
        </p>
      )}
    </div>
  )
}
```

**2.1.2 Update MacroTargetCard Component**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MacroProgressBar } from './macro-progress-bar'
import { typography, card } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface MacroTargetCardProps {
  // ... (same interface as above)
}

export function MacroTargetCard({
  targetCalories,
  proteinGrams,
  carbGrams,
  fatGrams,
  caloriesEaten = 0,
  proteinEaten = 0,
  carbsEaten = 0,
  fatEaten = 0,
  mealsLogged = 0,
  totalMealsPlanned = 0,
  onLogMeal,
  onViewPlan,
}: MacroTargetCardProps) {
  const router = useRouter()

  // Calculate overall progress
  const progressPercent = targetCalories > 0
    ? Math.round((caloriesEaten / targetCalories) * 100)
    : 0

  const caloriesRemaining = Math.max(0, targetCalories - caloriesEaten)

  // Determine state
  const isEmpty = caloriesEaten === 0
  const isComplete = progressPercent >= 95
  const isOver = progressPercent > 110

  return (
    <Card className={cn('shadow-md', card.padding.md)}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn(typography.h3, 'text-charcoal')}>
            Today's Macro Target
          </h2>
          {totalMealsPlanned > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {mealsLogged} of {totalMealsPlanned} meals logged
            </p>
          )}
        </div>

        {/* Status Badge */}
        {isComplete && !isOver && (
          <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <p className="text-xs font-bold text-green-700">On Track ✓</p>
          </div>
        )}
        {isOver && (
          <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full">
            <p className="text-xs font-bold text-red-700">Over Target</p>
          </div>
        )}
      </div>

      {/* Calorie Summary */}
      <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Calories
            </p>
            <p className={cn(typography.display, 'text-charcoal')}>
              {caloriesEaten.toLocaleString()}
              <span className="text-xl text-muted-foreground ml-1">
                / {targetCalories.toLocaleString()}
              </span>
            </p>
          </div>

          {caloriesRemaining > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">
                Remaining
              </p>
              <p className={cn(typography.h2, 'text-primary')}>
                {caloriesRemaining.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-500',
                progressPercent >= 90 && progressPercent <= 110 ? 'bg-green-500' :
                progressPercent > 110 ? 'bg-red-500' : 'bg-primary'
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right mt-1">
            {progressPercent}% eaten
          </p>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="space-y-4 mb-4">
        <MacroProgressBar
          type="protein"
          eaten={proteinEaten}
          target={proteinGrams}
          showCalories
        />
        <MacroProgressBar
          type="carbs"
          eaten={carbsEaten}
          target={carbGrams}
          showCalories
        />
        <MacroProgressBar
          type="fat"
          eaten={fatEaten}
          target={fatGrams}
          showCalories
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onLogMeal || (() => router.push('/meals/log'))}
          className="flex-1 font-semibold"
          aria-label="Log a meal"
        >
          <Plus className="size-4 mr-2" />
          Log Meal
        </Button>

        <Button
          variant="outline"
          onClick={onViewPlan || (() => router.push('/plans/today'))}
          className="flex-1 font-medium"
          aria-label="View today's meal plan"
        >
          View Plan
        </Button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Log your first meal to start tracking your macros
          </p>
        </div>
      )}
    </Card>
  )
}
```

### 2.2 Testing Requirements

- [ ] Test with eaten = 0 (empty state)
- [ ] Test with eaten = 50% of target
- [ ] Test with eaten = 95% of target (on track badge)
- [ ] Test with eaten = 120% of target (over target badge + red bars)
- [ ] Test calorie calculations for all macros (protein/carbs ×4, fat ×9)
- [ ] Test button click handlers
- [ ] Test responsive layout (mobile, tablet, desktop)

---

## 3. Recent Plans Carousel Improvements (CRITICAL)

### 3.1 Replace Stock Images with Macro Ring

**New File:** `components/dashboard/macro-ring.tsx`

```typescript
'use client'

import { macroColors } from '@/lib/design-tokens'

interface MacroRingProps {
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
}

export function MacroRing({
  proteinGrams,
  carbGrams,
  fatGrams,
  size = 'md',
  showLegend = false,
}: MacroRingProps) {
  // Calculate total and percentages
  const totalGrams = proteinGrams + carbGrams + fatGrams
  const proteinPercent = (proteinGrams / totalGrams) * 100
  const carbsPercent = (carbGrams / totalGrams) * 100
  const fatPercent = (fatGrams / totalGrams) * 100

  // Size mappings
  const sizes = {
    sm: { ring: 80, stroke: 12, fontSize: 'text-xs' },
    md: { ring: 120, stroke: 16, fontSize: 'text-sm' },
    lg: { ring: 160, stroke: 20, fontSize: 'text-base' },
  }

  const { ring, stroke, fontSize } = sizes[size]
  const radius = (ring - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate stroke dash offsets for each segment
  const proteinOffset = 0
  const carbsOffset = (proteinPercent / 100) * circumference
  const fatOffset = carbsOffset + (carbsPercent / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG Ring */}
      <svg width={ring} height={ring} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={stroke}
        />

        {/* Protein segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.protein.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(proteinPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={proteinOffset}
          strokeLinecap="round"
        />

        {/* Carbs segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.carbs.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(carbsPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-carbsOffset}
          strokeLinecap="round"
        />

        {/* Fat segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.fat.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(fatPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-fatOffset}
          strokeLinecap="round"
        />

        {/* Center text */}
        <text
          x={ring / 2}
          y={ring / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`${fontSize} font-bold fill-charcoal transform rotate-90`}
          transform={`rotate(90 ${ring / 2} ${ring / 2})`}
        >
          Macros
        </text>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full" style={{ backgroundColor: macroColors.protein.primary }} />
            <span>{Math.round(proteinPercent)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full" style={{ backgroundColor: macroColors.carbs.primary }} />
            <span>{Math.round(carbsPercent)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full" style={{ backgroundColor: macroColors.fat.primary }} />
            <span>{Math.round(fatPercent)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3.2 Update MealPlanCard Component

**File:** `components/dashboard/meal-plan-card.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { MacroRing } from './macro-ring'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

interface MealPlanCardProps {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  isActive?: boolean
  daysCompleted?: number
  totalDays?: number
  onClick?: () => void
}

export function MealPlanCard({
  id,
  name,
  dateRange,
  caloriesPerDay,
  proteinGrams,
  carbGrams,
  fatGrams,
  isActive = false,
  daysCompleted = 0,
  totalDays = 7,
  onClick,
}: MealPlanCardProps) {
  const completionPercent = totalDays > 0
    ? Math.round((daysCompleted / totalDays) * 100)
    : 0

  return (
    <Card
      className={cn(
        'p-4 border-2 cursor-pointer transition-all hover:shadow-lg relative',
        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${isActive ? 'Active: ' : ''}View ${name} meal plan`}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
          Active
        </div>
      )}

      {/* Macro Ring (replaces 2x2 image grid) */}
      <div className="flex justify-center mb-3 pt-2">
        <MacroRing
          proteinGrams={proteinGrams}
          carbGrams={carbGrams}
          fatGrams={fatGrams}
          size="sm"
        />
      </div>

      {/* Plan Details */}
      <div className="space-y-2">
        <p className="text-base font-bold text-charcoal leading-tight">
          {name}
        </p>

        <p className="text-sm text-muted-foreground">{dateRange}</p>

        {/* Macro Breakdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-charcoal">
            {caloriesPerDay.toLocaleString()} cal
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {proteinGrams}P / {carbGrams}C / {fatGrams}F
          </span>
        </div>

        {/* Completion Progress */}
        {totalDays > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium text-charcoal">
                {daysCompleted}/{totalDays} days
              </span>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: totalDays }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-1 rounded-full',
                    i < daysCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
```

### 3.3 Update Dashboard Store

**File:** `stores/dashboard-store.ts`

Add to MealPlan interface:

```typescript
export interface MealPlan {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  proteinGrams: number // ADD
  carbGrams: number // ADD
  fatGrams: number // ADD
  isActive?: boolean // ADD
  daysCompleted?: number // ADD
  totalDays?: number // ADD
  images: string[] // Keep for now, but won't be used
  createdAt: Date
}
```

### 3.4 Update Dummy Data

**File:** `lib/data/dummy-dashboard-data.ts`

```typescript
export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: '1',
    name: '7-Day Muscle Plan',
    dateRange: 'Nov 4-10, 2025',
    caloriesPerDay: 2450,
    proteinGrams: 180,
    carbGrams: 280,
    fatGrams: 65,
    isActive: true,
    daysCompleted: 3,
    totalDays: 7,
    images: [], // Empty now
    createdAt: new Date('2025-11-04'),
  },
  {
    id: '2',
    name: 'High-Protein Week',
    dateRange: 'Oct 28-Nov 3, 2025',
    caloriesPerDay: 2600,
    proteinGrams: 200,
    carbGrams: 250,
    fatGrams: 80,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-28'),
  },
  {
    id: '3',
    name: 'Lean Bulk Cycle',
    dateRange: 'Oct 21-27, 2025',
    caloriesPerDay: 2800,
    proteinGrams: 170,
    carbGrams: 350,
    fatGrams: 75,
    daysCompleted: 7,
    totalDays: 7,
    images: [],
    createdAt: new Date('2025-10-21'),
  },
]
```

### 3.5 Update Carousel Width

**File:** `components/dashboard/recent-plans-carousel.tsx`

Change card width from 75% to 85%:

```typescript
<div
  key={plan.id}
  className="flex-shrink-0 w-[85%] snap-center md:w-[45%] lg:w-[30%]"
>
  <MealPlanCard
    {...plan}
    onClick={() => router.push(`/plans/${plan.id}`)}
  />
</div>
```

Add scroll indicators:

```typescript
{plans.length > 1 && (
  <div className="flex justify-center gap-2 mt-2">
    {plans.map((_, index) => (
      <div
        key={index}
        className={cn(
          'w-2 h-2 rounded-full transition-all',
          index === 0 ? 'bg-primary w-4' : 'bg-muted'
        )}
      />
    ))}
  </div>
)}
```

---

## 4. Stats Grid Redesign (HIGH)

### 4.1 New Component: StatsCard

**New File:** `components/dashboard/stats-card.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { typography } from '@/lib/design-tokens'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    danger: 'border-red-200 bg-red-50/50',
  }

  return (
    <Card className={cn('p-4 border-2', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className={cn(typography.h2, 'text-charcoal')}>
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>

        <div className={cn(
          'p-2 rounded-lg',
          variant === 'success' && 'bg-green-100',
          variant === 'warning' && 'bg-amber-100',
          variant === 'danger' && 'bg-red-100',
          variant === 'default' && 'bg-primary/10'
        )}>
          <Icon className={cn(
            'size-5',
            variant === 'success' && 'text-green-600',
            variant === 'warning' && 'text-amber-600',
            variant === 'danger' && 'text-red-600',
            variant === 'default' && 'text-primary'
          )} />
        </div>
      </div>
    </Card>
  )
}
```

### 4.2 Update StatsGrid Component

**File:** `components/dashboard/stats-grid.tsx`

```typescript
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
    macroAccuracy >= 90 ? 'success' :
    macroAccuracy >= 75 ? 'warning' :
    'danger'

  return (
    <div className="grid grid-cols-2 gap-3 px-4 md:px-6 lg:px-8">
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
        trend={monthlyTrend ? {
          value: monthlyTrend,
          label: 'this month',
          isPositive: monthlyTrend > 0,
        } : undefined}
      />
    </div>
  )
}
```

### 4.3 Update Dashboard Page Props

**File:** `app/dashboard/page.tsx`

Update StatsGrid usage:

```typescript
<StatsGrid
  currentStreak={stats.currentStreak}
  daysLoggedThisWeek={stats.daysLoggedThisWeek}
  macroAccuracy={stats.macroAccuracy}
  plansCreated={stats.plansCreated}
  monthlyTrend={stats.monthlyTrend}
/>
```

### 4.4 Update Dashboard Store

**File:** `stores/dashboard-store.ts`

Update Stats interface:

```typescript
export interface DashboardStats {
  currentStreak: number // NEW
  daysLoggedThisWeek: number // NEW
  macroAccuracy: number // NEW (0-100)
  plansCreated: number
  mealsLogged: number
  monthlyTrend?: number // NEW
}
```

Update dummy data initialization:

```typescript
if (stats.currentStreak === 0) {
  dashboardStore.setStats({
    currentStreak: 7,
    daysLoggedThisWeek: 5,
    macroAccuracy: 94,
    plansCreated: 12,
    mealsLogged: 45,
    monthlyTrend: 3,
  })
}
```

---

## 5. Generate Plan CTA Refinement (HIGH)

### 5.1 Update Component

**File:** `components/dashboard/generate-plan-cta.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, ChefHat } from 'lucide-react'

interface GeneratePlanCTAProps {
  hasActivePlan?: boolean
  onClick?: () => void
}

export function GeneratePlanCTA({ hasActivePlan = false, onClick }: GeneratePlanCTAProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push('/plans/generate')
    }
  }

  // If user has active plan, make this more subtle
  if (hasActivePlan) {
    return (
      <div className="px-4 md:px-6 lg:px-8">
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Need a new plan?
              </p>
              <p className="text-sm text-muted-foreground">
                Generate a fresh macro-balanced meal plan
              </p>
            </div>
            <Button
              onClick={handleClick}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white font-medium"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No active plan - show prominent CTA
  return (
    <div className="px-4 md:px-6 lg:px-8">
      <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white space-y-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ChefHat className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold leading-tight">
              Generate Your First Meal Plan
            </p>
            <p className="text-sm font-normal leading-normal text-white/90 mt-1">
              AI-powered plans tailored to your macros • {/*7 days • 4 meals per day*/}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleClick}
            className="flex-1 bg-white text-primary hover:bg-white/90 font-bold"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => router.push('/plans/learn-more')}
            variant="ghost"
            className="text-white hover:bg-white/20 font-medium"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 5.2 Update Dashboard Usage

**File:** `app/dashboard/page.tsx`

Pass hasActivePlan prop:

```typescript
<GeneratePlanCTA
  hasActivePlan={recentPlans.some(p => p.isActive)}
/>
```

---

## 6. Greeting Header Enhancement (HIGH)

### 6.1 Update Component

**File:** `components/dashboard/greeting-header.tsx`

```typescript
'use client'

import { useGreeting } from '@/lib/hooks/use-greeting'
import { typography } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface GreetingHeaderProps {
  userName?: string
  currentStreak?: number
  currentGoal?: 'bulk' | 'cut' | 'maintain' | 'recomp'
  activePlanName?: string
  activePlanDay?: number
  activePlanTotalDays?: number
}

export function GreetingHeader({
  userName,
  currentStreak = 0,
  currentGoal,
  activePlanName,
  activePlanDay,
  activePlanTotalDays,
}: GreetingHeaderProps) {
  const greeting = useGreeting(userName)

  // Generate context message
  const getContextMessage = () => {
    if (activePlanName && activePlanDay && activePlanTotalDays) {
      return `Day ${activePlanDay} of ${activePlanName}`
    }

    if (currentGoal) {
      const goalText = {
        bulk: 'your bulk',
        cut: 'your cut',
        maintain: 'maintenance',
        recomp: 'your recomp',
      }[currentGoal]
      return `Week ${Math.ceil(currentStreak / 7)} of ${goalText}`
    }

    if (currentStreak >= 7) {
      return `${currentStreak}-day streak 🔥`
    }

    return 'Let's crush your goals today'
  }

  return (
    <div className="px-4 pt-2 pb-4 md:px-6 lg:px-8">
      <h1 className={cn(typography.h1, 'text-charcoal')}>
        {greeting}
      </h1>
      <p className="text-base text-muted-foreground mt-1 font-medium">
        {getContextMessage()}
      </p>
    </div>
  )
}
```

### 6.2 Update Dashboard Usage

**File:** `app/dashboard/page.tsx`

```typescript
<GreetingHeader
  currentStreak={stats.currentStreak}
  currentGoal={onboardingStore.goal}
  activePlanName={recentPlans.find(p => p.isActive)?.name}
  activePlanDay={recentPlans.find(p => p.isActive)?.daysCompleted}
  activePlanTotalDays={recentPlans.find(p => p.isActive)?.totalDays}
/>
```

---

## 7. Empty States Implementation (CRITICAL)

### 7.1 Create EmptyState Component

**New File:** `components/dashboard/empty-state.tsx`

```typescript
'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { typography } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 p-4 bg-muted rounded-full">
        <Icon className="size-12 text-muted-foreground" />
      </div>

      {/* Text */}
      <h3 className={cn(typography.h3, 'text-charcoal mb-2')}>
        {title}
      </h3>
      <p className="text-base text-muted-foreground max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onAction} size="lg" className="font-semibold">
          {actionLabel}
        </Button>

        {secondaryActionLabel && onSecondaryAction && (
          <Button
            onClick={onSecondaryAction}
            variant="outline"
            size="lg"
            className="font-medium"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
```

### 7.2 Update RecentPlansCarousel

**File:** `components/dashboard/recent-plans-carousel.tsx`

```typescript
import { EmptyState } from './empty-state'
import { Calendar } from 'lucide-react'

// ... in component

if (plans.length === 0) {
  return (
    <EmptyState
      icon={Calendar}
      title="No Meal Plans Yet"
      description="Create your first macro-perfect meal plan to start tracking your nutrition and hitting your goals."
      actionLabel="Generate Meal Plan"
      onAction={() => router.push('/plans/generate')}
      secondaryActionLabel="Learn More"
      onSecondaryAction={() => router.push('/plans/learn-more')}
    />
  )
}
```

---

## 8. Color System Implementation (HIGH)

### 8.1 Update tailwind.config.ts

Already covered in Section 1.2.

### 8.2 Create Color Utility Functions

**New File:** `lib/utils/colors.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Get progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90 && percentage <= 110) return 'text-green-600'
  if ((percentage >= 80 && percentage < 90) || (percentage > 110 && percentage <= 120)) {
    return 'text-amber-600'
  }
  return 'text-red-600'
}

/**
 * Get progress bar color class
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90 && percentage <= 110) return 'bg-green-500'
  if ((percentage >= 80 && percentage < 90) || (percentage > 110 && percentage <= 120)) {
    return 'bg-amber-500'
  }
  return 'bg-red-500'
}

/**
 * Get macro category color
 */
export function getMacroColor(type: 'protein' | 'carbs' | 'fat'): {
  primary: string
  light: string
  bg: string
  text: string
  border: string
} {
  const colors = {
    protein: {
      primary: '#3B82F6',
      light: '#DBEAFE',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    carbs: {
      primary: '#F59E0B',
      light: '#FEF3C7',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    fat: {
      primary: '#EAB308',
      light: '#FEF9C3',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
  }

  return colors[type]
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Create `lib/design-tokens.ts`
- [ ] Update `tailwind.config.ts` with semantic colors
- [ ] Create `lib/utils/colors.ts`
- [ ] Test design tokens import in components

### Phase 2: Macro Target Card (Day 1-2)
- [ ] Create `MacroProgressBar` component
- [ ] Update `MacroTargetCard` component
- [ ] Test with various data states (empty, partial, complete, over)
- [ ] Verify responsive layout

### Phase 3: Plans Carousel (Day 2)
- [ ] Create `MacroRing` component
- [ ] Update `MealPlanCard` component
- [ ] Update carousel width and indicators
- [ ] Update dummy data with macro values
- [ ] Update dashboard store interface

### Phase 4: Stats Grid (Day 2-3)
- [ ] Create `StatsCard` component
- [ ] Update `StatsGrid` component
- [ ] Update dashboard store stats interface
- [ ] Update dummy data

### Phase 5: Other Components (Day 3)
- [ ] Update `GeneratePlanCTA` with conditional rendering
- [ ] Update `GreetingHeader` with context
- [ ] Create `EmptyState` component
- [ ] Apply empty states to carousel

### Phase 6: Testing & Polish (Day 3)
- [ ] Test all components with real data
- [ ] Test responsive layouts
- [ ] Test empty states
- [ ] Test color system
- [ ] Accessibility audit
- [ ] Performance check

---

## Testing Strategy

### Unit Tests
- [ ] MacroProgressBar: Test progress calculations and colors
- [ ] MacroRing: Test SVG rendering and percentages
- [ ] StatsCard: Test variant styles
- [ ] EmptyState: Test action handlers

### Integration Tests
- [ ] Dashboard page renders with all components
- [ ] Data flows correctly from stores to components
- [ ] Navigation works (buttons, cards)

### Visual Regression Tests
- [ ] Screenshot dashboard in various states
- [ ] Compare with design mockups
- [ ] Test dark mode (if applicable)

### Performance Tests
- [ ] Measure initial load time
- [ ] Check for unnecessary re-renders
- [ ] Verify image optimization

---

## Acceptance Criteria

### Must Have (Critical)
- [x] Macro Target Card shows eaten/target for each macro
- [x] Macro Target Card has color-coded progress bars
- [x] Plans carousel uses macro rings instead of stock images
- [x] Plans carousel shows completion status
- [x] Active plan is clearly indicated
- [x] Empty states implemented for all sections
- [x] Stats grid shows 4 meaningful metrics

### Should Have (High)
- [x] Generate Plan CTA is context-aware (active plan vs no plan)
- [x] Greeting header shows personalized context
- [x] Semantic color system implemented throughout
- [x] Responsive design works on mobile/tablet/desktop

### Nice to Have (Future)
- [ ] Animations and transitions
- [ ] Haptic feedback on mobile
- [ ] Pull-to-refresh
- [ ] Skeleton loading states

---

## Deployment Notes

1. **Branch Strategy:**
   - Create feature branches for each major component
   - Merge to `feature/dashboard-home-screen` after testing
   - Final merge to `main` after full QA

2. **Database Changes:**
   - Update MealPlan schema to include macro values
   - Update Stats schema with new fields
   - Migration script needed if production data exists

3. **Environment Variables:**
   - No new environment variables required

4. **Dependencies:**
   - No new dependencies required
   - Using existing: lucide-react, @radix-ui components

5. **Breaking Changes:**
   - MealPlan interface updated (add macros, completion)
   - DashboardStats interface updated (new fields)
   - Existing data will need migration

---

## Support & Documentation

### For Planning Agent
- Use this spec to break down tasks into subtasks
- Estimate effort for each section (provided above)
- Identify dependencies between components

### For Coding Agent
- Follow TypeScript types exactly as specified
- Use design tokens from `lib/design-tokens.ts`
- Test each component individually before integration
- Follow accessibility best practices (ARIA labels, keyboard nav)

### For Review Agent
- Check against acceptance criteria
- Verify color contrast ratios (WCAG AA minimum)
- Test with screen reader
- Verify performance metrics

---

## Questions & Clarifications

If implementation questions arise:
1. Refer to `DASHBOARD_UX_DESIGN_REVIEW.md` for context
2. Check existing onboarding components for patterns
3. Ask user for clarification on ambiguous requirements

---

**End of Specification**

This specification is ready for the planning agent to create an implementation plan and the coding agent to begin development.
