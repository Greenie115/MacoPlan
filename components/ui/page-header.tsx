'use client'

/**
 * PageHeader Component
 *
 * Consistent page header across the app with optional back button,
 * title, subtitle, and right actions.
 */

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Page title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Show back button (uses router.back()) */
  showBackButton?: boolean
  /** Custom back button handler */
  onBack?: () => void
  /** Right side actions (buttons, menus, etc.) */
  rightActions?: React.ReactNode
  /** Make header sticky */
  sticky?: boolean
  /** Additional CSS classes */
  className?: string
  /** Center the title (when no back button) */
  centerTitle?: boolean
}

export function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightActions,
  sticky = true,
  className,
  centerTitle = false,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        'bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3',
        sticky && 'sticky top-0 z-10',
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Back button or spacer */}
        <div className="w-12 shrink-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="flex size-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors -ml-2"
            >
              <ArrowLeft className="size-5 text-gray-900" />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div
          className={cn(
            'flex-1 min-w-0',
            centerTitle && 'text-center',
            !centerTitle && showBackButton && 'text-center'
          )}
        >
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        {/* Right side - Actions or spacer */}
        <div className="w-12 shrink-0 flex justify-end">
          {rightActions}
        </div>
      </div>
    </header>
  )
}

/**
 * Simple page title without sticky header
 */
export function PageTitle({
  title,
  subtitle,
  className,
}: Pick<PageHeaderProps, 'title' | 'subtitle' | 'className'>) {
  return (
    <div className={cn('px-4 pt-2 pb-4', className)}>
      <h1 className="text-gray-900 tracking-tight text-[28px] font-semibold leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 text-base font-normal leading-normal pt-1">
          {subtitle}
        </p>
      )}
    </div>
  )
}
