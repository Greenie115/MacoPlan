/**
 * Spoonacular Badge Component
 *
 * Displays a "Powered by Spoonacular" badge on recipe cards and pages
 */

import { Sparkles } from 'lucide-react'

export function SpoonacularBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-700 font-medium ${sizeClasses[size]}`}
    >
      <Sparkles className={iconSizes[size]} />
      <span>Spoonacular</span>
    </div>
  )
}
