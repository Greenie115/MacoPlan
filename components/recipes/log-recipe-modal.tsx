'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { logMeal } from '@/app/actions/meal-logs'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { MEAL_TYPE_LABELS } from '@/lib/types/meal-log'

interface Recipe {
  id: string
  name: string
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  servings?: number
}

interface LogRecipeModalProps {
  open: boolean
  onClose: () => void
  recipe: Recipe
  onSuccess?: () => void
}

export function LogRecipeModal({
  open,
  onClose,
  recipe,
  onSuccess,
}: LogRecipeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [servingMultiplier, setServingMultiplier] = useState('1')
  const [mealType, setMealType] = useState<string>('')
  const [description, setDescription] = useState('')

  // Calculate adjusted macros based on serving multiplier
  const multiplier = parseFloat(servingMultiplier) || 1
  const adjustedMacros = {
    calories: Math.round(recipe.calories * multiplier),
    protein: Number((recipe.protein_grams * multiplier).toFixed(1)),
    carbs: Number((recipe.carb_grams * multiplier).toFixed(1)),
    fat: Number((recipe.fat_grams * multiplier).toFixed(1)),
  }

  const handleSubmit = async () => {
    if (!mealType) {
      toast.error('Please select a meal type')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await logMeal(
        {
          name: recipe.name,
          mealType: mealType as any,
          calories: adjustedMacros.calories,
          proteinGrams: adjustedMacros.protein,
          carbGrams: adjustedMacros.carbs,
          fatGrams: adjustedMacros.fat,
          servingSize: `${multiplier}x serving${multiplier !== 1 ? 's' : ''}`,
          description: description.trim() || undefined,
        },
        recipe.id
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Recipe logged successfully!')
        onClose()
        // Reset form
        setServingMultiplier('1')
        setMealType('')
        setDescription('')
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error logging recipe:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServingChange = (value: string) => {
    // Allow only positive numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setServingMultiplier(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Log {recipe.name}</DialogTitle>
          <DialogDescription>
            Adjust the serving size and select when you ate this meal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Serving Size Input */}
          <div className="space-y-2">
            <Label htmlFor="serving-size">
              Serving Size (multiplier)
            </Label>
            <div className="flex gap-2">
              <Input
                id="serving-size"
                type="text"
                inputMode="decimal"
                value={servingMultiplier}
                onChange={(e) => handleServingChange(e.target.value)}
                placeholder="1.0"
                className="flex-1"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                ×
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a number (e.g., 0.5 for half serving, 1.5 for one and a half servings)
            </p>
          </div>

          {/* Adjusted Macros Display */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Calories</Label>
              <p className="text-lg font-bold text-charcoal">
                {adjustedMacros.calories}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Protein</Label>
              <p className="text-lg font-bold text-primary">
                {adjustedMacros.protein}g
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Carbs</Label>
              <p className="text-lg font-bold text-blue-600">
                {adjustedMacros.carbs}g
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fat</Label>
              <p className="text-lg font-bold text-orange-600">
                {adjustedMacros.fat}g
              </p>
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type *</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="meal-type">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this meal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !mealType}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Meal'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
