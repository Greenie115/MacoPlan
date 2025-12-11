/**
 * FatSecret Meal Plan Generator Service
 *
 * Builds meal plans programmatically by:
 * 1. Searching recipes by meal type (Breakfast, Lunch, Dinner)
 * 2. Filtering by macro targets (high protein, low carb, etc.)
 * 3. Ensuring at least one meal per type
 * 4. Filling remaining slots with snacks
 */

import { fatSecretService } from './fatsecret'
import type {
  FatSecretRecipeSearchParams,
  FatSecretRecipeTypeFilter,
  NormalizedRecipe,
  MealType,
  MealSlot,
  DailyMealPlan,
  WeeklyMealPlan,
  MealPlanGenerationParams,
} from '@/lib/types/fatsecret'

// ============================================================================
// Configuration
// ============================================================================

// Meal type mappings to FatSecret recipe types
const MEAL_TYPE_FILTERS: Record<MealType, FatSecretRecipeTypeFilter[]> = {
  breakfast: ['Breakfast', 'Brunch', 'Smoothie'],
  lunch: ['Lunch', 'Main Dish', 'Salad', 'Sandwich', 'Soup'],
  dinner: ['Dinner', 'Main Dish'],
  snack: ['Snack', 'Appetizer', 'Smoothie', 'Dessert'],
}

// Search terms for high protein recipes
const HIGH_PROTEIN_TERMS = [
  'chicken',
  'beef',
  'salmon',
  'tuna',
  'eggs',
  'turkey',
  'shrimp',
  'pork',
  'tofu',
  'greek yogurt',
  'cottage cheese',
  'protein',
]

// Search terms for low carb recipes
const LOW_CARB_TERMS = [
  'keto',
  'low carb',
  'grilled',
  'roasted',
  'salad',
  'steak',
  'fish',
  'chicken breast',
  'cauliflower',
  'zucchini',
]

// Default calorie distribution per meal type (percentage of daily target)
const CALORIE_DISTRIBUTION: Record<MealType, number> = {
  breakfast: 0.25, // 25%
  lunch: 0.30, // 30%
  dinner: 0.30, // 30%
  snack: 0.15, // 15% (split among snacks)
}

// ============================================================================
// Meal Plan Generator Service
// ============================================================================

class FatSecretMealPlanService {
  // Request deduplication
  private inflightGenerations = new Map<string, Promise<DailyMealPlan | WeeklyMealPlan>>()

  // Recipe cache to avoid fetching same recipes multiple times
  private recipeCache = new Map<string, NormalizedRecipe>()

  /**
   * Generate a meal plan based on macro targets
   */
  async generateMealPlan(
    params: MealPlanGenerationParams
  ): Promise<DailyMealPlan | WeeklyMealPlan> {
    const cacheKey = JSON.stringify(params)

    // Check for in-flight request
    if (this.inflightGenerations.has(cacheKey)) {
      console.log('[MealPlanGenerator] Generation deduplicated')
      return this.inflightGenerations.get(cacheKey)!
    }

    const generatePromise = params.days === 1
      ? this.generateDailyPlan(params)
      : this.generateWeeklyPlan(params)

    this.inflightGenerations.set(cacheKey, generatePromise)
    generatePromise.finally(() => this.inflightGenerations.delete(cacheKey))

    return generatePromise
  }

  /**
   * Generate a single day meal plan
   */
  async generateDailyPlan(params: MealPlanGenerationParams): Promise<DailyMealPlan> {
    console.log('[MealPlanGenerator] Generating daily plan:', params)

    const meals: MealSlot[] = []
    const mealsPerDay = params.mealsPerDay || 4

    // Calculate calorie targets per meal type
    const mealTargets = this.calculateMealTargets(params)

    // Step 1: Always add breakfast, lunch, dinner
    const breakfastRecipe = await this.findRecipeForMeal('breakfast', mealTargets.breakfast, params)
    meals.push({
      type: 'breakfast',
      recipe: breakfastRecipe,
      targetCalories: mealTargets.breakfast.calories,
      targetProtein: mealTargets.breakfast.protein,
    })

    const lunchRecipe = await this.findRecipeForMeal('lunch', mealTargets.lunch, params)
    meals.push({
      type: 'lunch',
      recipe: lunchRecipe,
      targetCalories: mealTargets.lunch.calories,
      targetProtein: mealTargets.lunch.protein,
    })

    const dinnerRecipe = await this.findRecipeForMeal('dinner', mealTargets.dinner, params)
    meals.push({
      type: 'dinner',
      recipe: dinnerRecipe,
      targetCalories: mealTargets.dinner.calories,
      targetProtein: mealTargets.dinner.protein,
    })

    // Step 2: Add snacks to fill remaining slots
    const snacksNeeded = mealsPerDay - 3
    if (snacksNeeded > 0) {
      const snackCaloriesEach = mealTargets.snack.calories / snacksNeeded
      const snackProteinEach = mealTargets.snack.protein / snacksNeeded

      for (let i = 0; i < snacksNeeded; i++) {
        const snackRecipe = await this.findRecipeForMeal('snack', {
          calories: snackCaloriesEach,
          protein: snackProteinEach,
          carbs: params.targetCarbs * 0.1,
          fat: params.targetFat * 0.1,
        }, params, i) // Pass index for variety

        // Insert snack at logical position
        const insertPosition = this.getSnackInsertPosition(i, snacksNeeded)
        meals.splice(insertPosition, 0, {
          type: 'snack',
          recipe: snackRecipe,
          targetCalories: snackCaloriesEach,
          targetProtein: snackProteinEach,
        })
      }
    }

    // Calculate totals
    const totals = this.calculateTotals(meals)

    return {
      date: new Date().toISOString().split('T')[0],
      meals,
      ...totals,
    }
  }

  /**
   * Generate a weekly meal plan
   */
  async generateWeeklyPlan(params: MealPlanGenerationParams): Promise<WeeklyMealPlan> {
    console.log('[MealPlanGenerator] Generating weekly plan:', params)

    const days: DailyMealPlan[] = []
    const startDate = new Date()

    // Clear recipe cache between weeks for variety
    this.recipeCache.clear()

    for (let i = 0; i < params.days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const dailyPlan = await this.generateDailyPlan({
        ...params,
        days: 1,
      })

      days.push({
        ...dailyPlan,
        date: date.toISOString().split('T')[0],
      })

      // Small delay to avoid rate limiting
      if (i < params.days - 1) {
        await this.delay(100)
      }
    }

    // Calculate averages
    const avgCalories = days.reduce((sum, d) => sum + d.totalCalories, 0) / days.length
    const avgProtein = days.reduce((sum, d) => sum + d.totalProtein, 0) / days.length
    const avgCarbs = days.reduce((sum, d) => sum + d.totalCarbs, 0) / days.length
    const avgFat = days.reduce((sum, d) => sum + d.totalFat, 0) / days.length

    return {
      startDate: startDate.toISOString().split('T')[0],
      days,
      averageCalories: Math.round(avgCalories),
      averageProtein: Math.round(avgProtein),
      averageCarbs: Math.round(avgCarbs),
      averageFat: Math.round(avgFat),
    }
  }

  /**
   * Find a recipe matching the meal type and macro targets
   */
  private async findRecipeForMeal(
    mealType: MealType,
    targets: { calories: number; protein: number; carbs: number; fat: number },
    params: MealPlanGenerationParams,
    varietyIndex: number = 0
  ): Promise<NormalizedRecipe | null> {
    const recipeTypes = MEAL_TYPE_FILTERS[mealType]
    const usedRecipeIds = new Set(
      Array.from(this.recipeCache.values()).map(r => r.id)
    )

    // Build search terms based on macro targets
    const searchTerms = this.buildSearchTerms(mealType, params)

    // Try each recipe type until we find a match
    for (const recipeType of recipeTypes) {
      try {
        // Search with different terms for variety
        const searchTerm = searchTerms[varietyIndex % searchTerms.length]

        const response = await fatSecretService.searchRecipes({
          search_expression: searchTerm,
          recipe_type: recipeType,
          max_results: 20,
          page_number: varietyIndex, // Different page for variety
        })

        if (!response.recipes?.recipe) continue

        const recipes = Array.isArray(response.recipes.recipe)
          ? response.recipes.recipe
          : [response.recipes.recipe]

        // Filter and score recipes
        const scoredRecipes = recipes
          .filter(r => !usedRecipeIds.has(r.recipe_id))
          .map(r => ({
            recipe: r,
            score: this.scoreRecipe(r, targets, params),
          }))
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)

        if (scoredRecipes.length > 0) {
          // Pick from top candidates with some randomness for variety
          const topCandidates = scoredRecipes.slice(0, 5)
          const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)]

          // Get full recipe details
          const details = await fatSecretService.getRecipeDetails(selected.recipe.recipe_id)

          if (details) {
            const normalized = fatSecretService.normalizeRecipe(details)
            this.recipeCache.set(normalized.id, normalized)
            console.log(`[MealPlanGenerator] Found ${mealType}: ${normalized.title} (${normalized.calories} cal, ${normalized.protein}g protein)`)
            return normalized
          }
        }
      } catch (error) {
        console.warn(`[MealPlanGenerator] Error searching ${recipeType}:`, error)
      }
    }

    console.warn(`[MealPlanGenerator] Could not find recipe for ${mealType}`)
    return null
  }

  /**
   * Build search terms based on meal type and macro preferences
   */
  private buildSearchTerms(
    mealType: MealType,
    params: MealPlanGenerationParams
  ): string[] {
    const terms: string[] = []

    // Check if high protein is prioritized
    const isHighProtein = params.targetProtein > params.targetCalories * 0.15 / 4

    // Check if low carb is prioritized
    const isLowCarb = params.targetCarbs < params.targetCalories * 0.35 / 4

    if (isHighProtein) {
      terms.push(...HIGH_PROTEIN_TERMS)
    }

    if (isLowCarb) {
      terms.push(...LOW_CARB_TERMS)
    }

    // Add meal-specific terms
    switch (mealType) {
      case 'breakfast':
        if (isHighProtein) {
          terms.push('eggs', 'protein pancakes', 'greek yogurt', 'omelette')
        } else {
          terms.push('oatmeal', 'smoothie bowl', 'avocado toast', 'breakfast')
        }
        break
      case 'lunch':
        if (isHighProtein) {
          terms.push('chicken salad', 'tuna wrap', 'turkey sandwich', 'grilled chicken')
        } else {
          terms.push('salad', 'soup', 'wrap', 'bowl')
        }
        break
      case 'dinner':
        if (isHighProtein) {
          terms.push('grilled salmon', 'chicken breast', 'steak', 'shrimp')
        } else {
          terms.push('stir fry', 'pasta', 'curry', 'roasted')
        }
        break
      case 'snack':
        if (isHighProtein) {
          terms.push('protein bar', 'hard boiled eggs', 'cottage cheese', 'nuts')
        } else {
          terms.push('fruit', 'yogurt', 'energy balls', 'hummus')
        }
        break
    }

    // Add dietary preferences
    if (params.dietaryPreferences?.includes('vegetarian')) {
      terms.push('vegetarian', 'veggie', 'plant based')
    }
    if (params.dietaryPreferences?.includes('vegan')) {
      terms.push('vegan', 'plant based')
    }

    // Shuffle for variety
    return this.shuffleArray(terms)
  }

  /**
   * Score a recipe based on how well it matches targets
   */
  private scoreRecipe(
    recipe: { recipe_id: string; recipe_nutrition?: { calories: string; protein: string; carbohydrate: string; fat: string } },
    targets: { calories: number; protein: number; carbs: number; fat: number },
    params: MealPlanGenerationParams
  ): number {
    if (!recipe.recipe_nutrition) return 0

    const calories = parseFloat(recipe.recipe_nutrition.calories) || 0
    const protein = parseFloat(recipe.recipe_nutrition.protein) || 0
    const carbs = parseFloat(recipe.recipe_nutrition.carbohydrate) || 0
    const fat = parseFloat(recipe.recipe_nutrition.fat) || 0

    // Skip if way off on calories (more than 50% over or under)
    if (calories < targets.calories * 0.5 || calories > targets.calories * 1.5) {
      return 0
    }

    let score = 100

    // Calorie match (up to 30 points deducted)
    const calorieError = Math.abs(calories - targets.calories) / targets.calories
    score -= calorieError * 30

    // Protein match - weighted heavily for high protein goals (up to 40 points deducted)
    const proteinError = Math.abs(protein - targets.protein) / Math.max(targets.protein, 1)
    const isHighProtein = params.targetProtein > params.targetCalories * 0.15 / 4
    score -= proteinError * (isHighProtein ? 40 : 20)

    // Carb match - weighted heavily for low carb goals (up to 20 points deducted)
    const carbError = Math.abs(carbs - targets.carbs) / Math.max(targets.carbs, 1)
    const isLowCarb = params.targetCarbs < params.targetCalories * 0.35 / 4
    if (isLowCarb && carbs > targets.carbs * 1.2) {
      score -= 30 // Penalize high carb recipes for low carb diets
    } else {
      score -= carbError * 10
    }

    // Fat match (up to 10 points deducted)
    const fatError = Math.abs(fat - targets.fat) / Math.max(targets.fat, 1)
    score -= fatError * 10

    // Bonus for high protein foods
    if (protein >= targets.protein) {
      score += 10
    }

    return Math.max(score, 0)
  }

  /**
   * Calculate macro targets for each meal type
   */
  private calculateMealTargets(params: MealPlanGenerationParams): Record<MealType, { calories: number; protein: number; carbs: number; fat: number }> {
    const mealsPerDay = params.mealsPerDay || 4
    const snackCount = Math.max(0, mealsPerDay - 3)

    // Adjust distribution if fewer meals
    let distribution = { ...CALORIE_DISTRIBUTION }

    if (mealsPerDay === 3) {
      // No snacks - redistribute
      distribution = {
        breakfast: 0.28,
        lunch: 0.36,
        dinner: 0.36,
        snack: 0,
      }
    } else if (snackCount > 0) {
      // Adjust snack allocation
      const snackTotal = snackCount * 0.08 // ~8% per snack
      const mainMealReduction = snackTotal / 3

      distribution = {
        breakfast: 0.25 - mainMealReduction,
        lunch: 0.30 - mainMealReduction,
        dinner: 0.30 - mainMealReduction,
        snack: snackTotal,
      }
    }

    return {
      breakfast: {
        calories: Math.round(params.targetCalories * distribution.breakfast),
        protein: Math.round(params.targetProtein * distribution.breakfast),
        carbs: Math.round(params.targetCarbs * distribution.breakfast),
        fat: Math.round(params.targetFat * distribution.breakfast),
      },
      lunch: {
        calories: Math.round(params.targetCalories * distribution.lunch),
        protein: Math.round(params.targetProtein * distribution.lunch),
        carbs: Math.round(params.targetCarbs * distribution.lunch),
        fat: Math.round(params.targetFat * distribution.lunch),
      },
      dinner: {
        calories: Math.round(params.targetCalories * distribution.dinner),
        protein: Math.round(params.targetProtein * distribution.dinner),
        carbs: Math.round(params.targetCarbs * distribution.dinner),
        fat: Math.round(params.targetFat * distribution.dinner),
      },
      snack: {
        calories: Math.round(params.targetCalories * distribution.snack),
        protein: Math.round(params.targetProtein * distribution.snack),
        carbs: Math.round(params.targetCarbs * distribution.snack),
        fat: Math.round(params.targetFat * distribution.snack),
      },
    }
  }

  /**
   * Get insert position for snacks (between main meals)
   */
  private getSnackInsertPosition(snackIndex: number, totalSnacks: number): number {
    // Strategy:
    // 1 snack: after lunch (position 2)
    // 2 snacks: after breakfast (1), after lunch (3)
    // 3 snacks: after breakfast (1), after lunch (3), after dinner (5)
    const positions = [2, 1, 4]
    return positions[snackIndex] || 5
  }

  /**
   * Calculate total macros from meals
   */
  private calculateTotals(meals: MealSlot[]): {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  } {
    return meals.reduce(
      (totals, meal) => {
        if (meal.recipe) {
          totals.totalCalories += meal.recipe.calories
          totals.totalProtein += meal.recipe.protein
          totals.totalCarbs += meal.recipe.carbs
          totals.totalFat += meal.recipe.fat
        }
        return totals
      },
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    )
  }

  /**
   * Shuffle array for variety
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Validate macro match for quality assurance
   */
  validateMacroMatch(
    target: number,
    actual: number
  ): { isWithinTolerance: boolean; percentDiff: number } {
    const diff = Math.abs(actual - target)
    const percentDiff = (diff / target) * 100

    return {
      isWithinTolerance: percentDiff <= 15, // ±15% tolerance
      percentDiff: Math.round(percentDiff * 10) / 10,
    }
  }
}

// Export singleton instance
export const fatSecretMealPlanService = new FatSecretMealPlanService()

// Export class for testing
export { FatSecretMealPlanService }
