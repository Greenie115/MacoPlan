'use client'

/**
 * FatSecret Attribution Component
 *
 * Required by FatSecret Platform API Terms of Use.
 * Must be displayed wherever FatSecret content is shown.
 *
 * Usage:
 * - variant="badge" - Shows the official "Powered by fatsecret" image badge
 * - variant="text" - Shows the text link "Powered by fatsecret"
 * - variant="minimal" - Smaller text for inline use
 *
 * @see https://platform.fatsecret.com/api/Default.aspx?screen=rapiref2
 */

import { cn } from '@/lib/utils'

interface FatSecretAttributionProps {
  variant?: 'badge' | 'text' | 'minimal'
  className?: string
}

export function FatSecretAttribution({
  variant = 'text',
  className
}: FatSecretAttributionProps) {
  if (variant === 'badge') {
    return (
      <a
        href="https://www.fatsecret.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn('inline-block', className)}
      >
        <img
          src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.svg"
          alt="Powered by fatsecret"
          className="h-6"
        />
      </a>
    )
  }

  if (variant === 'minimal') {
    return (
      <a
        href="https://www.fatsecret.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'text-xs text-muted-foreground hover:text-foreground transition-colors',
          className
        )}
      >
        Powered by fatsecret
      </a>
    )
  }

  // Default: text variant (official HTML snippet)
  return (
    // Begin fatsecret Platform API HTML Attribution Snippet
    <a
      href="https://www.fatsecret.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-sm text-muted-foreground hover:text-primary transition-colors',
        className
      )}
    >
      Powered by fatsecret
    </a>
    // End fatsecret Platform API HTML Attribution Snippet
  )
}
