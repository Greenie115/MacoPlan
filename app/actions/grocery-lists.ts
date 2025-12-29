'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// Input Validation Schemas
// ============================================================================

const GenerateGroceryListSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
})

const ToggleGroceryItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
})

const AddCustomItemSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
  ingredient: z
    .string()
    .min(1, 'Ingredient is required')
    .max(200, 'Ingredient name is too long')
    .regex(/^[a-zA-Z0-9\s,.'()-]+$/, 'Ingredient contains invalid characters'),
  amount: z.string().max(50, 'Amount is too long').optional(),
  unit: z.string().max(30, 'Unit is too long').optional(),
  category: z
    .enum(['produce', 'protein', 'dairy', 'grains', 'pantry', 'other'])
    .default('other'),
})

const DeleteGroceryItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  listId: z.string().uuid('Invalid list ID'),
})

const GetGroceryListSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
})

interface GroceryItem {
  category: string
  ingredient: string
  amount: string
  unit?: string
  recipeId?: string
}

/**
 * Generate grocery list from a meal plan
 */
export async function generateGroceryList(planId: string) {
  // Validate input
  const validation = GenerateGroceryListSchema.safeParse({ planId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 1. Verify user owns the meal plan
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('id, title')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    console.error('Error fetching plan:', planError)
    return { error: 'Meal plan not found' }
  }

  // 2. Get all meals in the plan with their recipe ingredients
  const { data: planMeals, error: mealsError } = await supabase
    .from('plan_meals')
    .select(`
      id,
      recipe_id,
      plan_day_id,
      plan_days!inner (
        plan_id
      )
    `)
    .eq('plan_days.plan_id', planId)
    .not('recipe_id', 'is', null)

  if (mealsError) {
    console.error('Error fetching plan meals:', mealsError)
    return { error: 'Failed to fetch meal plan recipes' }
  }

  if (!planMeals || planMeals.length === 0) {
    return { error: 'No recipes found in this meal plan. Please add some recipes first.' }
  }

  // 3. Get unique recipe IDs
  const recipeIds = [...new Set(planMeals.map((meal) => meal.recipe_id).filter(Boolean))]

  // 4. Fetch all ingredients for these recipes
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, ingredient, amount, unit, order_index')
    .in('recipe_id', recipeIds)
    .order('order_index', { ascending: true })

  if (ingredientsError || !ingredients) {
    console.error('Error fetching ingredients:', ingredientsError)
    return { error: 'Failed to fetch recipe ingredients' }
  }

  // 5. Aggregate ingredients by name
  const aggregatedIngredients = aggregateIngredients(ingredients)

  // 6. Create grocery list
  const { data: groceryList, error: listError } = await supabase
    .from('grocery_lists')
    .insert({
      user_id: user.id,
      plan_id: planId,
      name: `${plan.title} - Grocery List`,
    })
    .select()
    .single()

  if (listError) {
    console.error('Error creating grocery list:', listError)
    return { error: 'Failed to create grocery list' }
  }

  // 7. Insert grocery list items
  const items = aggregatedIngredients.map((item, index) => ({
    list_id: groceryList.id,
    category: categorizeIngredient(item.ingredient),
    ingredient: item.ingredient,
    amount: item.amount,
    unit: item.unit || '',
    recipe_id: item.recipeId,
    order_index: index,
    is_custom: false,
    checked: false,
  }))

  const { error: itemsError } = await supabase.from('grocery_list_items').insert(items)

  if (itemsError) {
    console.error('Error adding items to grocery list:', itemsError)
    return { error: 'Failed to add items to grocery list' }
  }

  revalidatePath(`/meal-plans/${planId}`)
  revalidatePath('/meal-plans')
  revalidatePath(`/grocery-lists/${groceryList.id}`)
  return { success: true, listId: groceryList.id }
}

/**
 * Aggregate and combine similar ingredients
 */
function aggregateIngredients(ingredients: any[]): GroceryItem[] {
  const ingredientMap = new Map<string, GroceryItem>()

  ingredients.forEach((ing) => {
    const key = ing.ingredient.toLowerCase().trim()
    const existing = ingredientMap.get(key)

    if (existing) {
      // Combine quantities (simplified - just concatenate for now)
      existing.amount = combineAmounts(existing.amount, ing.amount)
    } else {
      ingredientMap.set(key, {
        category: categorizeIngredient(ing.ingredient),
        ingredient: ing.ingredient,
        amount: ing.amount || '',
        unit: ing.unit || '',
        recipeId: ing.recipe_id,
      })
    }
  })

  return Array.from(ingredientMap.values())
}

/**
 * Categorize ingredient into grocery categories
 */
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase()

  // Pantry (check first to avoid conflicts with "pepper")
  if (
    lower.includes('oil') ||
    (lower.includes('salt') && !lower.includes('unsalted')) ||
    lower.includes('spice') ||
    lower.includes('sauce') ||
    lower.includes('dressing') ||
    lower.includes('vinegar') ||
    lower.includes('syrup') ||
    lower.includes('seasoning') ||
    (lower.includes('pepper') && (lower.includes('black') || lower.includes('white') || lower.includes('red pepper flake')))
  ) {
    return 'pantry'
  }

  // Protein
  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('turkey') ||
    lower.includes('steak') ||
    lower.includes('shrimp') ||
    lower.includes('tuna') ||
    lower.includes('eggs')
  ) {
    return 'protein'
  }

  // Produce (check after pantry to handle "pepper" correctly)
  if (
    lower.includes('lettuce') ||
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('pepper') || // bell peppers
    lower.includes('carrot') ||
    lower.includes('broccoli') ||
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('cucumber') ||
    lower.includes('mushroom') ||
    lower.includes('berry') ||
    lower.includes('berries') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('avocado') ||
    lower.includes('asparagus')
  ) {
    return 'produce'
  }

  // Dairy
  if (
    lower.includes('cheese') ||
    lower.includes('milk') ||
    lower.includes('yogurt') ||
    lower.includes('butter') ||
    lower.includes('cream') ||
    lower.includes('parmesan')
  ) {
    return 'dairy'
  }

  // Grains
  if (
    lower.includes('rice') ||
    lower.includes('pasta') ||
    lower.includes('bread') ||
    lower.includes('quinoa') ||
    lower.includes('oats') ||
    lower.includes('flour') ||
    lower.includes('crouton')
  ) {
    return 'grains'
  }

  return 'other'
}

/**
 * Combine two amounts (simplified version)
 */
function combineAmounts(amount1: string, amount2: string): string {
  // Try to parse fractions first (before parseFloat)
  const fraction1 = parseFraction(amount1)
  const fraction2 = parseFraction(amount2)

  if (fraction1 !== null && fraction2 !== null) {
    const sum = fraction1 + fraction2
    return sum.toString()
  }

  // Then try numeric values
  const num1 = parseFloat(amount1)
  const num2 = parseFloat(amount2)

  if (!isNaN(num1) && !isNaN(num2)) {
    return (num1 + num2).toString()
  }

  // If we can't parse, just concatenate with " + "
  return `${amount1} + ${amount2}`
}

/**
 * Parse fraction strings like "1/2" to decimal
 */
function parseFraction(str: string): number | null {
  const match = str.match(/^(\d+)\/(\d+)$/)
  if (match) {
    const numerator = parseInt(match[1])
    const denominator = parseInt(match[2])
    if (denominator !== 0) {
      return numerator / denominator
    }
  }
  return null
}

/**
 * Toggle grocery item checked status
 */
export async function toggleGroceryItem(itemId: string) {
  // Validate input
  const validation = ToggleGroceryItemSchema.safeParse({ itemId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get current checked status
  const { data: item, error: fetchError } = await supabase
    .from('grocery_list_items')
    .select('checked, list_id')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    console.error('Error fetching item:', fetchError)
    return { error: 'Item not found' }
  }

  // Toggle checked status
  const { error: updateError } = await supabase
    .from('grocery_list_items')
    .update({ checked: !item.checked })
    .eq('id', itemId)

  if (updateError) {
    console.error('Error updating item:', updateError)
    return { error: 'Failed to update item' }
  }

  revalidatePath(`/grocery-lists/${item.list_id}`)
  return { success: true, checked: !item.checked }
}

/**
 * Add custom item to grocery list
 */
export async function addCustomGroceryItem(
  listId: string,
  ingredient: string,
  amount?: string,
  unit?: string,
  category: string = 'other'
) {
  // Validate input with Zod
  const validation = AddCustomItemSchema.safeParse({
    listId,
    ingredient,
    amount,
    unit,
    category,
  })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const validated = validation.data

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get the highest order_index for this list
  const { data: maxOrderData } = await supabase
    .from('grocery_list_items')
    .select('order_index')
    .eq('list_id', validated.listId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrderIndex = (maxOrderData?.order_index ?? -1) + 1

  const { error } = await supabase.from('grocery_list_items').insert({
    list_id: validated.listId,
    category: validated.category,
    ingredient: validated.ingredient.trim(),
    amount: validated.amount?.trim() || '',
    unit: validated.unit?.trim() || '',
    is_custom: true,
    checked: false,
    order_index: nextOrderIndex,
  })

  if (error) {
    console.error('Error adding custom item:', error)
    return { error: 'Failed to add item' }
  }

  revalidatePath(`/grocery-lists/${validated.listId}`)
  return { success: true }
}

/**
 * Delete grocery list item (only custom items)
 */
export async function deleteGroceryItem(itemId: string, listId: string) {
  // Validate input
  const validation = DeleteGroceryItemSchema.safeParse({ itemId, listId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Verify it's a custom item before deleting
  const { data: item, error: fetchError } = await supabase
    .from('grocery_list_items')
    .select('is_custom')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    console.error('Error fetching item:', fetchError)
    return { error: 'Item not found' }
  }

  if (!item.is_custom) {
    return { error: 'Can only delete custom items' }
  }

  const { error } = await supabase.from('grocery_list_items').delete().eq('id', itemId)

  if (error) {
    console.error('Error deleting item:', error)
    return { error: 'Failed to delete item' }
  }

  revalidatePath(`/grocery-lists/${listId}`)
  return { success: true }
}

/**
 * Get grocery list by ID
 */
export async function getGroceryList(listId: string) {
  // Validate input
  const validation = GetGroceryListSchema.safeParse({ listId })
  if (!validation.success) {
    return { error: validation.error.issues[0].message, data: null }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required', data: null }
  }

  const { data: list, error } = await supabase
    .from('grocery_lists')
    .select(`
      *,
      grocery_list_items (
        id,
        category,
        ingredient,
        amount,
        unit,
        checked,
        is_custom,
        order_index
      )
    `)
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

  if (error || !list) {
    console.error('Error fetching grocery list:', error)
    return { error: 'Grocery list not found', data: null }
  }

  return { success: true, data: list }
}
