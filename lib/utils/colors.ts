/**
 * Color utility functions for MacroPlan
 */

/**
 * Get progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90 && percentage <= 110) return 'text-green-600'
  if (
    (percentage >= 80 && percentage < 90) ||
    (percentage > 110 && percentage <= 120)
  ) {
    return 'text-amber-600'
  }
  return 'text-red-600'
}

/**
 * Get progress bar color class
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90 && percentage <= 110) return 'bg-green-500'
  if (
    (percentage >= 80 && percentage < 90) ||
    (percentage > 110 && percentage <= 120)
  ) {
    return 'bg-amber-500'
  }
  return 'bg-red-500'
}

/**
 * Get macro category color
 */
export function getMacroColor(
  type: 'protein' | 'carbs' | 'fat'
): {
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
