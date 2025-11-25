'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import type { LoggedMeal } from '@/lib/types/meal-log'
import { MEAL_TYPE_EMOJIS, MEAL_TYPE_LABELS } from '@/lib/types/meal-log'
import { cn } from '@/lib/utils'

interface MealLogItemProps {
  meal: LoggedMeal
  onEdit: (meal: LoggedMeal) => void
  onDelete: (mealId: string) => void
}

export function MealLogItem({ meal, onEdit, onDelete }: MealLogItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Format time from logged_at timestamp
  const loggedTime = new Date(meal.logged_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <>
      <Card className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          {/* Meal Type Icon */}
          <div className="text-2xl md:text-3xl flex-shrink-0">
            {MEAL_TYPE_EMOJIS[meal.meal_type]}
          </div>

          {/* Meal Details */}
          <div className="flex-1 min-w-0">
            {/* Header: Name and Time */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm md:text-base text-charcoal truncate">
                  {meal.name}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {MEAL_TYPE_LABELS[meal.meal_type]} • {loggedTime}
                </p>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(meal)}
                  className="h-8 w-8 p-0"
                  aria-label="Edit meal"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete meal"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Macro Summary */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mt-2">
              <span className="font-medium text-charcoal">
                {meal.calories} cal
              </span>
              <span className="text-muted-foreground">•</span>
              <span>{meal.protein_grams}g P</span>
              <span className="text-muted-foreground">•</span>
              <span>{meal.carb_grams}g C</span>
              <span className="text-muted-foreground">•</span>
              <span>{meal.fat_grams}g F</span>
            </div>

            {/* Serving Size (if provided) */}
            {meal.serving_size && (
              <p className="text-xs text-muted-foreground mt-1">
                Serving: {meal.serving_size}
              </p>
            )}

            {/* Description (if provided) */}
            {meal.description && (
              <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                {meal.description}
              </p>
            )}

            {/* Action Buttons - Mobile */}
            <div className="flex sm:hidden items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(meal)}
                className="flex-1 h-8"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{meal.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(meal.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
