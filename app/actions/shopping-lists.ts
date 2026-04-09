'use server'

/**
 * Server Actions for Shopping Lists (MVP)
 *
 * Essential actions: generate, get, export PDF/CSV
 */

import { createClient } from '@/lib/supabase/server'
import { recipeApiService } from '@/lib/services/recipe-api'
import { generateShoppingList, generateShoppingListCSV, type RecipeIngredient } from '@/lib/utils/shopping-list-generator'
import type {
  ShoppingList,
  ShoppingListInsert,
  CategorizedIngredients,
} from '@/lib/types/database'

// ============================================================================
// Generate Shopping List from Meal Plan
// ============================================================================

export async function generateShoppingListFromMealPlan(
  mealPlanId: string
): Promise<{
  success: boolean
  data?: ShoppingList
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Get meal plan with meals
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .eq('user_id', user.id)
      .single()

    if (!plan) {
      return { success: false, error: 'Meal plan not found' }
    }

    const { data: meals } = await supabase
      .from('meal_plan_meals')
      .select('*')
      .eq('meal_plan_id', mealPlanId)

    if (!meals || meals.length === 0) {
      return { success: false, error: 'No meals found in meal plan' }
    }

    // Step 2: Fetch full recipe details for all recipes
    const allIngredients: RecipeIngredient[] = []

    for (const meal of meals) {
      if (meal.recipe_source === 'recipe-api' && meal.recipe_api_id) {
        try {
          const recipe = await recipeApiService.getRecipeDetails(meal.recipe_api_id)

          if (recipe?.ingredients) {
            // Recipe-API.com returns ingredients in groups
            const formattedIngredients: RecipeIngredient[] = recipe.ingredients.flatMap(
              (group, groupIdx) => group.items.map((ing, idx) => ({
                id: `${meal.recipe_api_id}-${groupIdx}-${idx}`,
                name: ing.name,
                original: [ing.quantity, ing.unit, ing.name, ing.preparation ? `(${ing.preparation})` : ''].filter(Boolean).join(' '),
                amount: (ing.quantity || 1) * meal.serving_multiplier,
                unit: ing.unit || '',
              }))
            )
            allIngredients.push(...formattedIngredients)
          }
        } catch (error) {
          console.error(
            `[ShoppingList] Error fetching recipe ${meal.recipe_api_id}:`,
            error
          )
          // Continue with other recipes
        }
      }
      // TODO: Handle local recipes if needed
    }

    if (allIngredients.length === 0) {
      return { success: false, error: 'No ingredients found in recipes' }
    }

    // Step 3: Generate categorized shopping list
    const categorizedIngredients = generateShoppingList(allIngredients)

    // Step 4: Save to database
    const shoppingListData: ShoppingListInsert = {
      user_id: user.id,
      meal_plan_id: mealPlanId,
      name: `Shopping List - ${plan.name}`,
      start_date: plan.start_date,
      end_date: plan.end_date,
      ingredients: categorizedIngredients as any,
      checked_items: [],
      last_exported_pdf_at: null,
      last_exported_csv_at: null,
    }

    const { data: savedList, error } = await supabase
      .from('shopping_lists')
      .upsert(shoppingListData, {
        onConflict: 'user_id,meal_plan_id',
      })
      .select()
      .single()

    if (error || !savedList) {
      console.error('[ShoppingList] Error saving:', error)
      return { success: false, error: 'Failed to save shopping list' }
    }

    return { success: true, data: savedList as ShoppingList }
  } catch (error) {
    console.error('[ShoppingList] Unexpected error:', error)
    return { success: false, error: 'Failed to generate shopping list' }
  }
}

// ============================================================================
// Get Shopping List for Meal Plan
// ============================================================================

export async function getShoppingList(
  mealPlanId: string
): Promise<{
  success: boolean
  data?: ShoppingList
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      console.error('[GetShoppingList] Error:', error)
      return { success: false, error: 'Shopping list not found' }
    }

    return { success: true, data: data as ShoppingList }
  } catch (error) {
    console.error('[GetShoppingList] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch shopping list' }
  }
}

// ============================================================================
// Export Shopping List as CSV
// ============================================================================

export async function exportShoppingListCSV(
  listId: string
): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: list } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single()

    if (!list) {
      return { success: false, error: 'Shopping list not found' }
    }

    const csv = generateShoppingListCSV(
      list.ingredients as CategorizedIngredients,
      list.checked_items || []
    )

    // Update last exported timestamp
    await supabase
      .from('shopping_lists')
      .update({ last_exported_csv_at: new Date().toISOString() })
      .eq('id', listId)

    return { success: true, data: csv }
  } catch (error) {
    console.error('[ExportCSV] Unexpected error:', error)
    return { success: false, error: 'Failed to export CSV' }
  }
}
