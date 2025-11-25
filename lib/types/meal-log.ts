/**
 * TypeScript types for meal logging functionality
 */

export interface LoggedMeal {
  id: string
  user_id: string
  logged_at: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  name: string
  description: string | null
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  serving_size: string | null
  recipe_id: string | null
  plan_meal_id: string | null
  created_at: string
  updated_at: string
}

export interface LogMealInput {
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  calories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  servingSize?: string
  description?: string
}

export interface DailyTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  mealsLogged: number
}

export const MEAL_TYPE_LABELS: Record<LoggedMeal['meal_type'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  other: 'Other',
}

export const MEAL_TYPE_EMOJIS: Record<LoggedMeal['meal_type'], string> = {
  breakfast: '🍳',
  lunch: '🍱',
  dinner: '🍽️',
  snack: '🥤',
  other: '🍴',
}
