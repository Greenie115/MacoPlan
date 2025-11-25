'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { LoggedMeal } from '@/lib/types/meal-log'
import { MEAL_TYPE_LABELS } from '@/lib/types/meal-log'

const logMealSchema = z.object({
  name: z
    .string()
    .min(1, 'Meal name is required')
    .max(100, 'Meal name must be less than 100 characters'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  calories: z
    .number()
    .min(0, 'Calories must be a positive number')
    .max(10000, 'Calories seem too high'),
  proteinGrams: z
    .number()
    .min(0, 'Protein must be a positive number')
    .max(1000, 'Protein seems too high'),
  carbGrams: z
    .number()
    .min(0, 'Carbs must be a positive number')
    .max(1000, 'Carbs seem too high'),
  fatGrams: z
    .number()
    .min(0, 'Fat must be a positive number')
    .max(1000, 'Fat seems too high'),
  servingSize: z.string().max(50, 'Serving size is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
})

type LogMealFormValues = z.infer<typeof logMealSchema>

interface LogMealFormProps {
  editMeal?: LoggedMeal
  onSubmit: (values: LogMealFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function LogMealForm({
  editMeal,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: LogMealFormProps) {
  const form = useForm<LogMealFormValues>({
    resolver: zodResolver(logMealSchema),
    defaultValues: editMeal
      ? {
          name: editMeal.name,
          mealType: editMeal.meal_type,
          calories: Number(editMeal.calories),
          proteinGrams: Number(editMeal.protein_grams),
          carbGrams: Number(editMeal.carb_grams),
          fatGrams: Number(editMeal.fat_grams),
          servingSize: editMeal.serving_size || '',
          description: editMeal.description || '',
        }
      : {
          name: '',
          mealType: 'breakfast',
          calories: 0,
          proteinGrams: 0,
          carbGrams: 0,
          fatGrams: 0,
          servingSize: '',
          description: '',
        },
  })

  // Track if user has manually entered calories
  const hasManualCalories = useRef(!!editMeal) // If editing, treat existing calories as manual

  // Watch macro fields for auto-calculation
  const proteinGrams = form.watch('proteinGrams')
  const carbGrams = form.watch('carbGrams')
  const fatGrams = form.watch('fatGrams')

  // Auto-calculate calories based on macros (Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g)
  useEffect(() => {
    // Skip if user has manually entered calories
    if (hasManualCalories.current) return

    const hasMacros = proteinGrams > 0 || carbGrams > 0 || fatGrams > 0

    if (hasMacros) {
      const calculatedCalories = Math.round(
        (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9)
      )

      if (calculatedCalories > 0) {
        form.setValue('calories', calculatedCalories, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    }
  }, [proteinGrams, carbGrams, fatGrams, form])

  const handleSubmit = async (values: LogMealFormValues) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
        {/* Meal Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Chicken & Rice"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meal Type */}
        <FormField
          control={form.control}
          name="mealType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nutritional Information Grid */}
        <div>
          <h3 className="text-sm font-medium mb-3 md:mb-4">
            Nutritional Information *
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Calories */}
            <FormField
              control={form.control}
              name="calories"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Calories</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Auto-calculated"
                      {...field}
                      value={value || ''}
                      onChange={(e) => {
                        // Mark that user has manually entered calories
                        hasManualCalories.current = true
                        onChange(e.target.valueAsNumber || 0)
                      }}
                      onFocus={() => {
                        // If user focuses on empty calories field, clear the flag to allow recalc
                        if (!value || value === 0) {
                          hasManualCalories.current = false
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Leave empty to auto-calculate from macros
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Protein */}
            <FormField
              control={form.control}
              name="proteinGrams"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Protein (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Carbs */}
            <FormField
              control={form.control}
              name="carbGrams"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fat */}
            <FormField
              control={form.control}
              name="fatGrams"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Fat (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Serving Size (Optional) */}
        <FormField
          control={form.control}
          name="servingSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serving Size (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 1 cup, 200g"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes (Optional) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this meal..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMeal ? 'Updating...' : 'Logging...'}
              </>
            ) : (
              <>{editMeal ? 'Update Meal' : 'Log Meal'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
