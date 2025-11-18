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
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn(typography.h2, 'text-charcoal')}>{value}</p>

          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'success' && 'bg-green-100',
            variant === 'warning' && 'bg-amber-100',
            variant === 'danger' && 'bg-red-100',
            variant === 'default' && 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'size-5',
              variant === 'success' && 'text-green-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'danger' && 'text-red-600',
              variant === 'default' && 'text-primary'
            )}
          />
        </div>
      </div>
    </Card>
  )
}
