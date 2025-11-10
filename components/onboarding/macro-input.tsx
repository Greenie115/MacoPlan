'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, AlertTriangle } from 'lucide-react'

export type MacroMode = 'grams' | 'percentage'

interface MacroInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  mode: MacroMode
  targetCalories?: number
  error?: string
  warning?: string
  min?: number
  max?: number
  helpText?: string
}

/**
 * Reusable input component for macro entry
 * Supports both grams and percentage modes with validation
 */
export function MacroInput({
  label,
  value,
  onChange,
  mode,
  targetCalories,
  error,
  warning,
  min = 0,
  max,
  helpText,
}: MacroInputProps) {
  const unit = mode === 'grams' ? 'g' : '%'
  const inputMax = mode === 'grams' ? (max || 1000) : (max || 100)

  // Calculate calories for display
  const calories = mode === 'grams' && targetCalories
    ? label === 'Fat'
      ? value * 9
      : value * 4
    : 0

  // Calculate grams from percentage for display
  const gramsFromPercentage = mode === 'percentage' && targetCalories
    ? label === 'Fat'
      ? Math.round((value / 100) * targetCalories / 9)
      : Math.round((value / 100) * targetCalories / 4)
    : 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onChange(0)
      return
    }

    const num = parseFloat(val)
    if (isNaN(num)) return

    // Clamp value to min/max
    const clamped = Math.max(min, Math.min(inputMax, num))
    onChange(Math.round(clamped))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`macro-${label}`} className="text-sm font-medium">
          {label} ({unit})
        </Label>
        {mode === 'grams' && calories > 0 && (
          <span className="text-xs text-muted-foreground">
            {calories} cal
          </span>
        )}
        {mode === 'percentage' && gramsFromPercentage > 0 && (
          <span className="text-xs text-muted-foreground">
            → {gramsFromPercentage}g
          </span>
        )}
      </div>

      <Input
        id={`macro-${label}`}
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={inputMax}
        step={1}
        className={`
          ${error ? 'border-destructive focus-visible:ring-destructive' : ''}
          ${warning && !error ? 'border-yellow-500 focus-visible:ring-yellow-500' : ''}
        `}
      />

      {helpText && !error && !warning && (
        <p className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {warning && !error && (
        <div className="flex items-start gap-2 text-sm text-yellow-600">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  )
}
