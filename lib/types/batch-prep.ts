import { z } from 'zod'

export const MacrosSchema = z.object({
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
})
export type Macros = z.infer<typeof MacrosSchema>

export const EquipmentSchema = z.enum(['oven', 'rice_cooker', 'stovetop', 'none'])
export type Equipment = z.infer<typeof EquipmentSchema>

export const MealSlotSchema = z.enum(['breakfast', 'lunch', 'snack', 'dinner'])
export type MealSlot = z.infer<typeof MealSlotSchema>

export const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity_g: z.number().positive(),
  macros: MacrosSchema,
})
export type Ingredient = z.infer<typeof IngredientSchema>

export const MealSchema = z.object({
  name: z.string().min(1),
  meal_slot: MealSlotSchema,
  ingredients: z.array(IngredientSchema).min(1),
  total_macros: MacrosSchema,
  equipment: EquipmentSchema,
  servings_to_prep: z.number().int().positive(),
  storage_days: z.number().int().positive().max(7),
  prep_time_mins: z.number().int().nonnegative().optional(),
})
export type Meal = z.infer<typeof MealSchema>

export const PrepStepSchema = z.object({
  step: z.number().int().positive(),
  time: z.string().regex(/^\d+:\d{2}$/),
  action: z.string().min(1),
  duration_mins: z.number().int().nonnegative(),
  equipment: EquipmentSchema,
})
export type PrepStep = z.infer<typeof PrepStepSchema>

export const ShoppingItemSchema = z.object({
  ingredient: z.string().min(1),
  quantity_g: z.number().positive(),
  category: z.string().optional(),
})
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>

export const ContainerAssignmentSchema = z.object({
  container_num: z.number().int().positive(),
  day_type: z.enum(['training', 'rest']),
  meal_slot: MealSlotSchema,
  recipe_name: z.string().min(1),
})
export type ContainerAssignment = z.infer<typeof ContainerAssignmentSchema>

export const DayPlanSchema = z.object({
  meals: z.array(MealSchema).min(2).max(5),
  daily_totals: MacrosSchema,
})
export type DayPlan = z.infer<typeof DayPlanSchema>

export const BatchPrepPlanSchema = z.object({
  training_day: DayPlanSchema,
  rest_day: DayPlanSchema,
  prep_timeline: z.array(PrepStepSchema).min(3),
  shopping_list: z.array(ShoppingItemSchema).min(3),
  container_assignments: z.array(ContainerAssignmentSchema),
  total_containers: z.number().int().positive(),
  estimated_prep_time_mins: z.number().int().positive(),
})
export type BatchPrepPlan = z.infer<typeof BatchPrepPlanSchema>

export const PrepDaySchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])
export type PrepDay = z.infer<typeof PrepDaySchema>

export const TrainingProfileSchema = z.object({
  training_days_per_week: z.number().int().min(0).max(7),
  training_day_macros: MacrosSchema,
  rest_day_macros: MacrosSchema,
  prep_day: PrepDaySchema,
  containers_per_week: z.number().int().min(3).max(21),
  max_prep_time_mins: z.number().int().positive(),
})
export type TrainingProfile = z.infer<typeof TrainingProfileSchema>

export const DietaryPreferencesSchema = z.object({
  diet_type: z.string().optional(),
  exclusions: z.array(z.string()).default([]),
})
export type DietaryPreferences = z.infer<typeof DietaryPreferencesSchema>

export class BatchPrepValidationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'BatchPrepValidationError'
  }
}
