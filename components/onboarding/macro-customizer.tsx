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
  isValid: boolean
  errors: {
    protein?: string
    carbs?: string
    fat?: string
    total?: string
  }
  warnings: {
    protein?: string
    fat?: string
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
   * Validate macro values against all rules
   */
  const validate = (): MacroValidation => {
    const errors: MacroValidation['errors'] = {}
    const warnings: MacroValidation['warnings'] = {}

    if (mode === 'grams') {
      // Total calories validation (±50 cal tolerance)
      const totalCal = (protein * 4) + (carbs * 4) + (fat * 9)
      const difference = Math.abs(totalCal - targetCalories)

      if (difference > 50) {
        errors.total = `Total is ${totalCal} cal (${totalCal > targetCalories ? '+' : ''}${totalCal - targetCalories} from target)`
      }

      // Minimum protein validation
      if (protein < minProteinGrams) {
        warnings.protein = `Below recommended minimum (${minProteinGrams}g)`
      }

      // Minimum fat validation
      if (fat < minFatGrams) {
        errors.fat = `Below minimum for hormone health (${minFatGrams}g required)`
      }

      // Range validation
      if (protein < 0 || carbs < 0 || fat < 0) {
        errors.total = 'All values must be positive'
      }
    } else {
      // Percentage mode validation
      const totalPct = proteinPct + carbsPct + fatPct
      const difference = Math.abs(totalPct - 100)

      if (difference > 1) {
        errors.total = `Total is ${totalPct}% (must equal 100%)`
      }

      // Convert to grams for minimum validations
      const proteinGrams = Math.round((proteinPct / 100) * targetCalories / 4)
      const fatGrams = Math.round((fatPct / 100) * targetCalories / 9)

      if (proteinGrams < minProteinGrams) {
        warnings.protein = `Below recommended minimum (${minProteinGrams}g)`
      }

      if (fatGrams < minFatGrams) {
        errors.fat = `Below minimum for hormone health (${minFatGrams}g required)`
      }
    }

    const isValid = Object.keys(errors).length === 0

    return { isValid, errors, warnings }
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
   * Save custom macros
   */
  const handleSave = () => {
    if (!validation.isValid) return

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
              error={validation.errors.protein}
              warning={validation.warnings.protein}
              helpText={`Min: ${minProteinGrams}g recommended`}
            />
            <MacroInput
              label="Carbs"
              value={carbs}
              onChange={(v) => handleGramsChange('carbs', v)}
              mode="grams"
              targetCalories={targetCalories}
              error={validation.errors.carbs}
            />
            <MacroInput
              label="Fat"
              value={fat}
              onChange={(v) => handleGramsChange('fat', v)}
              mode="grams"
              targetCalories={targetCalories}
              error={validation.errors.fat}
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
              error={validation.errors.protein}
              warning={validation.warnings.protein}
              max={100}
            />
            <MacroInput
              label="Carbs"
              value={carbsPct}
              onChange={(v) => handlePercentageChange('carbs', v)}
              mode="percentage"
              targetCalories={targetCalories}
              error={validation.errors.carbs}
              max={100}
            />
            <MacroInput
              label="Fat"
              value={fatPct}
              onChange={(v) => handlePercentageChange('fat', v)}
              mode="percentage"
              targetCalories={targetCalories}
              error={validation.errors.fat}
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
          {validation.isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </div>

      {/* Total Error Message */}
      {validation.errors.total && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">
            {validation.errors.total}
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
          disabled={!validation.isValid || !hasChanges}
          className="flex-1"
        >
          Save
        </Button>
      </div>
    </Card>
  )
}
