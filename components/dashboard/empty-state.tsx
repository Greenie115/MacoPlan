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
      <h3 className={cn(typography.h3, 'text-charcoal mb-2')}>{title}</h3>
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
