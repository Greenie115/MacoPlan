'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogMealForm } from './log-meal-form'
import { logMeal, updateMealLog } from '@/app/actions/meal-logs'
import { toast } from 'sonner'
import type { LoggedMeal } from '@/lib/types/meal-log'

interface LogMealModalProps {
  open: boolean
  onClose: () => void
  editMeal?: LoggedMeal
  onSuccess?: () => void
}

export function LogMealModal({
  open,
  onClose,
  editMeal,
  onSuccess,
}: LogMealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: {
    name: string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
    calories: number
    proteinGrams: number
    carbGrams: number
    fatGrams: number
    servingSize?: string
    description?: string
  }) => {
    setIsSubmitting(true)

    try {
      let result

      if (editMeal) {
        // Update existing meal
        result = await updateMealLog(editMeal.id, values)
      } else {
        // Create new meal
        result = await logMeal(values)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(editMeal ? 'Meal updated!' : 'Meal logged!')
        onClose()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error submitting meal:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {editMeal ? 'Edit Meal' : 'Log Meal'}
          </DialogTitle>
          <DialogDescription>
            {editMeal
              ? 'Update the details of your logged meal.'
              : 'Enter the nutritional information for your meal.'}
          </DialogDescription>
        </DialogHeader>

        <LogMealForm
          editMeal={editMeal}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
