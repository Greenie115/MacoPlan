'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MacroInput, type MacroMode } from './macro-input'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface MacroCustomizerProps {
  targetCalories: number
  calculatedProtein: number
  calculatedCarbs: number
  calculatedFat: number
  currentProtein: number
  currentCarbs: number
  currentFat: number
  isCustom: boolean
  weightKg: number
  onSave: (macros: { protein: number; carbs: number; fat: number }) => void
  onReset: () => void
  onCancel: () => void
}

interface MacroValidation {
  warnings: {
    protein?: string
    carbs?: string
    fat?: string
    total?: string
  }
  info: {
    totalCalories?: string
    totalPercentage?: string
  }
}

/**
 * Main customization interface for adjusting macros
 * Supports grams and percentage modes with real-time validation
 */
export function MacroCustomizer({
  targetCalories,
  calculatedProtein,
  calculatedCarbs,
  calculatedFat,
  currentProtein,
  currentCarbs,
  currentFat,
  isCustom,
  weightKg,
  onSave,
  onReset,
  onCancel,
}: MacroCustomizerProps) {
  const [mode, setMode] = useState<MacroMode>('grams')
  const [protein, setProtein] = useState(currentProtein)
  const [carbs, setCarbs] = useState(currentCarbs)
  const [fat, setFat] = useState(currentFat)
  const [hasChanges, setHasChanges] = useState(false)

  // Percentage state (derived from grams)
  const [proteinPct, setProteinPct] = useState(
    Math.round((currentProtein * 4 / targetCalories) * 100)
  )
  const [carbsPct, setCarbsPct] = useState(
    Math.round((currentCarbs * 4 / targetCalories) * 100)
  )
  const [fatPct, setFatPct] = useState(
    Math.round((currentFat * 9 / targetCalories) * 100)
  )

  // Track if values have changed from initial
  useEffect(() => {
    const changed =
      protein !== currentProtein ||
      carbs !== currentCarbs ||
      fat !== currentFat
    setHasChanges(changed)
  }, [protein, carbs, fat, currentProtein, currentCarbs, currentFat])

  // Calculate minimum values
  const minProteinGrams = Math.round(weightKg * 1.6) // ISSN minimum
  const minFatGrams = Math.round(weightKg * 0.5) // Hormone health minimum

  /**
   * Validate macro values - shows warnings but doesn't block saving
   */
  const validate = (): MacroValidation => {
    const warnings: MacroValidation['warnings'] = {}
    const info: MacroValidation['info'] = {}

    if (mode === 'grams') {
      // Total calories info (informational only)
      const totalCal = (protein * 4) + (carbs * 4) + (fat * 9)
      const difference = totalCal - targetCalories

      info.totalCalories = `${totalCal} cal (${difference > 0 ? '+' : ''}${difference} from target)`

      // Minimum protein warning (informational)
      if (protein < minProteinGrams) {
        warnings.protein = `Below recommended minimum (${minProteinGrams}g)`
      }

      // Minimum fat warning (informational)
      if (fat < minFatGrams) {
        warnings.fat = `Below recommended minimum for hormone health (${minFatGrams}g)`
      }
    } else {
      // Percentage mode info
      const totalPct = proteinPct + carbsPct + fatPct
      const difference = totalPct - 100

      info.totalPercentage = `${totalPct}% (${difference > 0 ? '+' : ''}${difference}% from 100%)`

      // Convert to grams for minimum warnings
      const proteinGrams = Math.round((proteinPct / 100) * targetCalories / 4)
      const fatGrams = Math.round((fatPct / 100) * targetCalories / 9)

      if (proteinGrams < minProteinGrams) {
        warnings.protein = `Below recommended minimum (${minProteinGrams}g)`
      }

      if (fatGrams < minFatGrams) {
        warnings.fat = `Below recommended minimum for hormone health (${minFatGrams}g)`
      }
    }

    return { warnings, info }
  }

  const validation = validate()

  /**
   * Switch between grams and percentage modes with conversion
   */
  const handleModeSwitch = (newMode: MacroMode) => {
    if (newMode === 'percentage' && mode === 'grams') {
      // Grams → Percentage
      let pPct = Math.round((protein * 4 / targetCalories) * 100)
      let cPct = Math.round((carbs * 4 / targetCalories) * 100)
      let fPct = Math.round((fat * 9 / targetCalories) * 100)

      // Ensure total = 100% (adjust largest value)
      const total = pPct + cPct + fPct
      if (total !== 100) {
        const diff = 100 - total
        const max = Math.max(pPct, cPct, fPct)
        if (cPct === max) cPct += diff
        else if (pPct === max) pPct += diff
        else fPct += diff
      }

      setProteinPct(pPct)
      setCarbsPct(cPct)
      setFatPct(fPct)
    } else if (newMode === 'grams' && mode === 'percentage') {
      // Percentage → Grams
      setProtein(Math.round((proteinPct / 100) * targetCalories / 4))
      setCarbs(Math.round((carbsPct / 100) * targetCalories / 4))
      setFat(Math.round((fatPct / 100) * targetCalories / 9))
    }

    setMode(newMode)
  }

  /**
   * Handle value changes in grams mode
   */
  const handleGramsChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    if (macro === 'protein') setProtein(value)
    else if (macro === 'carbs') setCarbs(value)
    else setFat(value)
  }

  /**
   * Handle value changes in percentage mode
   */
  const handlePercentageChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    if (macro === 'protein') {
      setProteinPct(value)
      setProtein(Math.round((value / 100) * targetCalories / 4))
    } else if (macro === 'carbs') {
      setCarbsPct(value)
      setCarbs(Math.round((value / 100) * targetCalories / 4))
    } else {
      setFatPct(value)
      setFat(Math.round((value / 100) * targetCalories / 9))
    }
  }

  /**
   * Save custom macros (no validation blocking)
   */
  const handleSave = () => {
    onSave({ protein, carbs, fat })
  }

  /**
   * Reset to calculated values
   */
  const handleReset = () => {
    setProtein(calculatedProtein)
    setCarbs(calculatedCarbs)
    setFat(calculatedFat)
    setProteinPct(Math.round((calculatedProtein * 4 / targetCalories) * 100))
    setCarbsPct(Math.round((calculatedCarbs * 4 / targetCalories) * 100))
    setFatPct(Math.round((calculatedFat * 9 / targetCalories) * 100))
    setHasChanges(false)
    onReset()
  }

  // Calculate total for display
  const totalCal = (protein * 4) + (carbs * 4) + (fat * 9)
  const totalPct = proteinPct + carbsPct + fatPct

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">
            Customize Your Macros
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Target: {targetCalories.toLocaleString()} calories
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'grams' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeSwitch('grams')}
          className="flex-1"
        >
          Grams
        </Button>
        <Button
          variant={mode === 'percentage' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeSwitch('percentage')}
          className="flex-1"
        >
          Percentage
        </Button>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {mode === 'grams' ? (
          <>
            <MacroInput
              label="Protein"
              value={protein}
              onChange={(v) => handleGramsChange('protein', v)}
              mode="grams"
              targetCalories={targetCalories}
              warning={validation.warnings.protein}
              helpText={`Min: ${minProteinGrams}g recommended`}
            />
            <MacroInput
              label="Carbs"
              value={carbs}
              onChange={(v) => handleGramsChange('carbs', v)}
              mode="grams"
              targetCalories={targetCalories}
              warning={validation.warnings.carbs}
            />
            <MacroInput
              label="Fat"
              value={fat}
              onChange={(v) => handleGramsChange('fat', v)}
              mode="grams"
              targetCalories={targetCalories}
              warning={validation.warnings.fat}
              helpText={`Min: ${minFatGrams}g (hormone health)`}
            />
          </>
        ) : (
          <>
            <MacroInput
              label="Protein"
              value={proteinPct}
              onChange={(v) => handlePercentageChange('protein', v)}
              mode="percentage"
              targetCalories={targetCalories}
              warning={validation.warnings.protein}
              max={100}
            />
            <MacroInput
              label="Carbs"
              value={carbsPct}
              onChange={(v) => handlePercentageChange('carbs', v)}
              mode="percentage"
              targetCalories={targetCalories}
              warning={validation.warnings.carbs}
              max={100}
            />
            <MacroInput
              label="Fat"
              value={fatPct}
              onChange={(v) => handlePercentageChange('fat', v)}
              mode="percentage"
              targetCalories={targetCalories}
              warning={validation.warnings.fat}
              max={100}
            />
          </>
        )}
      </div>

      {/* Total Display */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-charcoal">Total</span>
        <div className="flex items-center gap-2">
          {mode === 'grams' ? (
            <span className="text-lg font-semibold">
              {totalCal.toLocaleString()} cal
            </span>
          ) : (
            <span className="text-lg font-semibold">
              {totalPct}%
            </span>
          )}
        </div>
      </div>

      {/* Total Info Message */}
      {validation.info.totalCalories && mode === 'grams' && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            {validation.info.totalCalories}
          </p>
        </div>
      )}

      {validation.info.totalPercentage && mode === 'percentage' && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            {validation.info.totalPercentage}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1"
        >
          Save
        </Button>
      </div>
    </Card>
  )
}
