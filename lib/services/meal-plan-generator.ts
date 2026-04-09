/**
 * Meal Plan Generator Service
 *
 * Builds meal plans programmatically by:
 * 1. Finding recipes that naturally match calorie targets (no forced scaling)
 * 2. Running searches in parallel for speed
 * 3. Returning recipes with original nutritional values (user adjusts servings manually)
 *
 * Uses Recipe-API.com for recipe search and Unsplash for images.
 */

import { recipeApiService } from './recipe-api'
import { unsplashService } from './unsplash'
import { checkDietaryConflict } from '@/lib/utils/recipe-keywords'
import type {
  NormalizedRecipe,
  MealType,
  MealSlot,
  DailyMealPlan,
  WeeklyMealPlan,
  MealPlanGenerationParams,
} from '@/lib/types/recipe'

// ============================================================================
// Configuration
// ============================================================================

// Meal type search term prefixes (base - used when no dietary restriction)
const MEAL_TYPE_SEARCH_PREFIXES: Record<MealType, string[]> = {
  breakfast: ['breakfast', 'morning', 'eggs', 'oatmeal', 'pancakes', 'omelette'],
  lunch: ['lunch', 'salad', 'sandwich', 'soup', 'wrap', 'bowl'],
  dinner: ['dinner', 'chicken', 'beef', 'salmon', 'grilled', 'roasted'],
  snack: ['snack', 'smoothie', 'protein', 'nuts', 'yogurt', 'energy'],
}

// Vegetarian-safe prefixes
const MEAL_TYPE_SEARCH_PREFIXES_VEGETARIAN: Record<MealType, string[]> = {
  breakfast: ['breakfast', 'morning', 'eggs', 'oatmeal', 'pancakes', 'omelette', 'vegetarian'],
  lunch: ['lunch', 'salad', 'sandwich', 'soup', 'wrap', 'bowl', 'vegetarian'],
  dinner: ['dinner', 'vegetarian', 'veggie', 'grilled', 'roasted', 'pasta', 'curry'],
  snack: ['snack', 'smoothie', 'protein', 'nuts', 'yogurt', 'energy'],
}

// Vegan-safe prefixes
const MEAL_TYPE_SEARCH_PREFIXES_VEGAN: Record<MealType, string[]> = {
  breakfast: ['breakfast', 'morning', 'vegan', 'oatmeal', 'smoothie', 'avocado'],
  lunch: ['lunch', 'salad', 'vegan', 'soup', 'wrap', 'bowl', 'falafel'],
  dinner: ['dinner', 'vegan', 'veggie', 'grilled', 'roasted', 'stir fry', 'curry'],
  snack: ['snack', 'smoothie', 'vegan', 'nuts', 'fruit', 'energy'],
}

// Keto-safe prefixes (low carb, high fat)
const MEAL_TYPE_SEARCH_PREFIXES_KETO: Record<MealType, string[]> = {
  breakfast: ['keto breakfast', 'eggs', 'bacon', 'avocado', 'omelette', 'low carb'],
  lunch: ['keto lunch', 'salad', 'grilled', 'chicken', 'bunless', 'low carb'],
  dinner: ['keto dinner', 'steak', 'salmon', 'grilled', 'roasted', 'low carb'],
  snack: ['keto snack', 'cheese', 'nuts', 'avocado', 'fat bomb', 'low carb'],
}

// Paleo-safe prefixes (no grains, legumes, dairy, processed)
const MEAL_TYPE_SEARCH_PREFIXES_PALEO: Record<MealType, string[]> = {
  breakfast: ['paleo breakfast', 'eggs', 'bacon', 'sweet potato', 'fruit', 'whole30'],
  lunch: ['paleo lunch', 'salad', 'grilled', 'chicken', 'fish', 'whole30'],
  dinner: ['paleo dinner', 'steak', 'salmon', 'grilled', 'roasted', 'whole30'],
  snack: ['paleo snack', 'nuts', 'fruit', 'beef jerky', 'vegetables', 'whole30'],
}

// Mediterranean prefixes (fish, olive oil, vegetables, whole grains)
const MEAL_TYPE_SEARCH_PREFIXES_MEDITERRANEAN: Record<MealType, string[]> = {
  breakfast: ['mediterranean breakfast', 'greek yogurt', 'eggs', 'olive oil', 'fruit'],
  lunch: ['mediterranean lunch', 'greek salad', 'hummus', 'falafel', 'fish'],
  dinner: ['mediterranean dinner', 'salmon', 'grilled fish', 'olive oil', 'greek'],
  snack: ['mediterranean snack', 'hummus', 'olives', 'nuts', 'fruit', 'greek yogurt'],
}

// Search terms for high protein recipes (meat-based)
const HIGH_PROTEIN_TERMS_MEAT = [
  'chicken', 'beef', 'salmon', 'tuna', 'turkey',
  'shrimp', 'pork',
]

// Search terms for high protein recipes (vegetarian-friendly)
const HIGH_PROTEIN_TERMS_VEGETARIAN = [
  'eggs', 'tofu', 'greek yogurt', 'cottage cheese', 'protein',
  'lentils', 'chickpea', 'beans', 'tempeh', 'paneer', 'quinoa',
]

// Search terms for high protein recipes (vegan-friendly)
const HIGH_PROTEIN_TERMS_VEGAN = [
  'tofu', 'tempeh', 'lentils', 'chickpea', 'beans', 'seitan',
  'quinoa', 'edamame', 'plant protein', 'vegan protein',
]

// Search terms for low carb recipes (meat-based)
const LOW_CARB_TERMS_MEAT = [
  'steak', 'fish', 'chicken breast',
]

// Search terms for low carb recipes (vegetarian-friendly)
const LOW_CARB_TERMS_VEGETARIAN = [
  'keto', 'low carb', 'grilled', 'roasted', 'salad',
  'cauliflower', 'zucchini', 'spinach', 'kale',
]

// Search terms for keto diet
const KETO_SEARCH_TERMS = [
  'keto', 'low carb', 'eggs', 'bacon', 'avocado', 'cheese',
  'chicken', 'salmon', 'steak', 'cauliflower', 'butter',
  'cream cheese', 'spinach', 'zucchini', 'fat bomb',
]

// Search terms for paleo diet
const PALEO_SEARCH_TERMS = [
  'paleo', 'whole30', 'grain free', 'chicken', 'beef', 'salmon',
  'eggs', 'sweet potato', 'vegetables', 'nuts', 'fruit',
  'grass fed', 'wild caught', 'avocado',
]

// Search terms for mediterranean diet
const MEDITERRANEAN_SEARCH_TERMS = [
  'mediterranean', 'greek', 'olive oil', 'salmon', 'fish',
  'hummus', 'falafel', 'quinoa', 'chickpea', 'lemon',
  'tomato', 'cucumber', 'feta', 'grilled fish',
]

// Foods to avoid for keto (high carb)
const KETO_AVOID_FOODS = [
  'bread', 'pasta', 'rice', 'potato', 'potatoes', 'noodles',
  'sugar', 'flour', 'corn', 'oatmeal', 'oats', 'cereal',
  'banana', 'apple', 'orange', 'grapes', 'mango',
  'beans', 'lentils', 'quinoa', 'couscous', 'tortilla',
  'pizza', 'sandwich', 'pancake', 'waffle', 'muffin',
  'cookie', 'cake', 'brownie', 'candy', 'soda',
]

// Foods to avoid for paleo (grains, legumes, dairy, processed)
const PALEO_AVOID_FOODS = [
  'bread', 'pasta', 'rice', 'oatmeal', 'oats', 'cereal', 'wheat',
  'corn', 'quinoa', 'barley', 'flour', 'tortilla', 'noodles',
  'beans', 'lentils', 'peanut', 'chickpea', 'soy', 'tofu', 'edamame',
  'milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream',
  'sugar', 'candy', 'soda', 'processed',
]

// Calorie tolerance - how close we try to match (tighter = better natural fits)
const CALORIE_TOLERANCE = 0.15

// ============================================================================
// Extended Types
// ============================================================================

export interface RecipeWithMultiplier extends NormalizedRecipe {
  servingMultiplier: number
  adjustedCalories: number
  adjustedProtein: number
  adjustedCarbs: number
  adjustedFat: number
}

export interface MealSlotWithMultiplier extends Omit<MealSlot, 'recipe'> {
  recipe: RecipeWithMultiplier | null
}

// ============================================================================
// Meal Plan Generator Service
// ============================================================================

class MealPlanGeneratorService {
  private inflightGenerations = new Map<string, Promise<DailyMealPlan | WeeklyMealPlan>>()
  private recipeCache = new Map<string, NormalizedRecipe>()

  /**
   * Generate a meal plan based on macro targets
   */
  async generateMealPlan(
    params: MealPlanGenerationParams
  ): Promise<DailyMealPlan | WeeklyMealPlan> {
    const cacheKey = JSON.stringify(params)

    if (this.inflightGenerations.has(cacheKey)) {
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
   * Finds recipes that naturally match calorie targets - no automatic scaling
   * Users can manually adjust serving sizes on the meal cards
   */
  async generateDailyPlan(params: MealPlanGenerationParams): Promise<DailyMealPlan> {
    const mealsPerDay = params.mealsPerDay || 4
    const mealTargets = this.calculateMealTargets(params)

    // Find recipes in parallel (natural calorie ranges, no forced scaling)
    const [breakfastResult, lunchResult, dinnerResult] = await Promise.all([
      this.findRecipeForMeal('breakfast', mealTargets.breakfast, params),
      this.findRecipeForMeal('lunch', mealTargets.lunch, params),
      this.findRecipeForMeal('dinner', mealTargets.dinner, params),
    ])

    // Build meals with 1x multiplier (original recipe values)
    const meals: MealSlotWithMultiplier[] = [
      this.createMealSlot('breakfast', breakfastResult, mealTargets.breakfast),
      this.createMealSlot('lunch', lunchResult, mealTargets.lunch),
      this.createMealSlot('dinner', dinnerResult, mealTargets.dinner),
    ]

    // Add snacks in parallel
    const snacksNeeded = mealsPerDay - 3
    if (snacksNeeded > 0) {
      const snackCaloriesEach = mealTargets.snack.calories / snacksNeeded
      const snackProteinEach = mealTargets.snack.protein / snacksNeeded

      const snackPromises = Array.from({ length: snacksNeeded }, (_, i) =>
        this.findRecipeForMeal('snack', {
          calories: snackCaloriesEach,
          protein: snackProteinEach,
          carbs: params.targetCarbs * 0.1,
          fat: params.targetFat * 0.1,
        }, params, i)
      )

      const snackResults = await Promise.all(snackPromises)

      snackResults.forEach((snackRecipe, i) => {
        const insertPosition = this.getSnackInsertPosition(i, snacksNeeded, meals.length)
        meals.splice(insertPosition, 0,
          this.createMealSlot('snack', snackRecipe, {
            calories: snackCaloriesEach,
            protein: snackProteinEach,
          })
        )
      })
    }

    // Calculate totals (no automatic adjustment - user controls serving sizes)
    const totals = this.calculateTotals(meals)
    return {
      date: new Date().toISOString().split('T')[0],
      meals: meals as MealSlot[],
      ...totals,
    }
  }

  /**
   * Create a meal slot with 1x multiplier (natural serving)
   */
  private createMealSlot(
    type: MealType,
    recipe: NormalizedRecipe | null,
    targets: { calories: number; protein: number }
  ): MealSlotWithMultiplier {
    if (!recipe) {
      return {
        type,
        recipe: null,
        targetCalories: targets.calories,
        targetProtein: targets.protein,
      }
    }

    const recipeWithMultiplier: RecipeWithMultiplier = {
      ...recipe,
      servingMultiplier: 1.0,
      adjustedCalories: recipe.calories,
      adjustedProtein: recipe.protein,
      adjustedCarbs: recipe.carbs,
      adjustedFat: recipe.fat,
    }

    return {
      type,
      recipe: recipeWithMultiplier,
      targetCalories: targets.calories,
      targetProtein: targets.protein,
    }
  }

  /**
   * Generate a weekly meal plan
   */
  async generateWeeklyPlan(params: MealPlanGenerationParams): Promise<WeeklyMealPlan> {
    const days: DailyMealPlan[] = []
    const startDate = new Date()

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

      if (i < params.days - 1) {
        await this.delay(100)
      }
    }

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
   * Find a recipe that naturally matches the calorie target (within tolerance)
   * No forced scaling - just find the best natural fit
   */
  private async findRecipeForMeal(
    mealType: MealType,
    targets: { calories: number; protein: number; carbs: number; fat: number },
    params: MealPlanGenerationParams,
    varietyIndex: number = 0
  ): Promise<NormalizedRecipe | null> {
    const usedRecipeIds = new Set(
      Array.from(this.recipeCache.values()).map(r => r.id)
    )

    const searchTerms = this.buildSearchTerms(mealType, params)

    // Select appropriate prefixes based on dietary style
    const dietaryStyle = params.dietaryPreferences?.[0] || null
    let mealPrefixes: string[]
    switch (dietaryStyle) {
      case 'vegan':
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES_VEGAN[mealType]
        break
      case 'vegetarian':
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES_VEGETARIAN[mealType]
        break
      case 'keto':
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES_KETO[mealType]
        break
      case 'paleo':
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES_PALEO[mealType]
        break
      case 'mediterranean':
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES_MEDITERRANEAN[mealType]
        break
      default:
        mealPrefixes = MEAL_TYPE_SEARCH_PREFIXES[mealType]
    }

    const maxAttempts = Math.min(searchTerms.length, 3)

    // Define acceptable calorie range (within tolerance of target)
    const minCalories = targets.calories * (1 - CALORIE_TOLERANCE)
    const maxCalories = targets.calories * (1 + CALORIE_TOLERANCE)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const prefix = mealPrefixes[(varietyIndex + attempt) % mealPrefixes.length]
        const term = searchTerms[(varietyIndex + attempt) % searchTerms.length]
        const searchQuery = `${prefix} ${term}`.trim()

        const response = await recipeApiService.searchRecipes({
          q: searchQuery,
          per_page: 30,
          page: Math.floor(varietyIndex / 2) + 1,
        })

        if (!response.data || response.data.length === 0) {
          continue
        }

        // Score recipes based on natural fit (no multiplier)
        const scoredRecipes = response.data
          .filter(r => !usedRecipeIds.has(r.id) && r.nutrition_summary)
          // Filter out recipes that violate dietary restrictions
          .filter(r => !this.hasDietaryConflict(r.name, params))
          .map(r => {
            const calories = r.nutrition_summary.calories || 0
            const protein = r.nutrition_summary.protein_g || 0
            const carbs = r.nutrition_summary.carbohydrates_g || 0
            const fat = r.nutrition_summary.fat_g || 0

            const score = this.scoreRecipeNatural(
              { calories, protein, carbs, fat },
              targets,
              params,
              minCalories,
              maxCalories
            )

            return { recipe: r, score, calories }
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)

        if (scoredRecipes.length > 0) {
          // Try top candidates until we find one that passes ingredient check
          const topCandidates = scoredRecipes.slice(0, 10)

          // Shuffle for variety but still check in order
          const shuffledCandidates = this.shuffleArray([...topCandidates])

          for (const candidate of shuffledCandidates) {
            const details = await recipeApiService.getRecipeDetails(candidate.recipe.id)

            if (details) {
              const image = await unsplashService.getImageForRecipe(details.id, details.name)
              const normalized = recipeApiService.normalizeRecipe(details, image?.url || null)

              // Check ingredients for dietary conflicts
              if (this.hasIngredientConflict(normalized, params)) {
                continue
              }

              this.recipeCache.set(normalized.id, normalized)
              return normalized
            }
          }

          // All candidates had conflicts, trying next search
        }
      } catch {
        // Search attempt failed, continue to next
      }
    }

    return null
  }

  /**
   * Score a recipe based on natural fit (no multiplier scaling)
   */
  private scoreRecipeNatural(
    recipe: { calories: number; protein: number; carbs: number; fat: number },
    targets: { calories: number; protein: number; carbs: number; fat: number },
    params: MealPlanGenerationParams,
    minCalories: number,
    maxCalories: number
  ): number {
    // Reject recipes outside the acceptable calorie range
    if (recipe.calories < minCalories * 0.5 || recipe.calories > maxCalories * 1.5) {
      return 0
    }

    let score = 100

    // Calorie match (most important - up to 50 points)
    const calorieError = Math.abs(recipe.calories - targets.calories) / targets.calories
    score -= calorieError * 50

    // Protein match (up to 25 points)
    const proteinError = Math.abs(recipe.protein - targets.protein) / Math.max(targets.protein, 1)
    const isHighProtein = params.targetProtein > params.targetCalories * 0.15 / 4
    score -= proteinError * (isHighProtein ? 25 : 15)

    // Carb match (up to 15 points)
    const carbError = Math.abs(recipe.carbs - targets.carbs) / Math.max(targets.carbs, 1)
    const isLowCarb = params.targetCarbs < params.targetCalories * 0.35 / 4
    if (isLowCarb && recipe.carbs > targets.carbs * 1.3) {
      score -= 20
    } else {
      score -= carbError * 15
    }

    // Fat match (up to 10 points)
    const fatError = Math.abs(recipe.fat - targets.fat) / Math.max(targets.fat, 1)
    score -= fatError * 10

    // Bonus for being close to target
    if (calorieError < 0.15) score += 15
    if (calorieError < 0.10) score += 10
    if (proteinError < 0.20) score += 5

    return Math.max(score, 0)
  }

  /**
   * Check if a recipe NAME conflicts with dietary preferences or excluded ingredients
   * Used for quick filtering before fetching full details
   * Returns true if the recipe should be EXCLUDED
   */
  private hasDietaryConflict(
    recipeName: string,
    params: MealPlanGenerationParams
  ): boolean {
    // Extract dietary style from preferences (first one if multiple)
    const dietaryStyle = params.dietaryPreferences?.[0] || null

    // Check against dietary style (vegetarian, vegan, pescatarian, etc.)
    if (checkDietaryConflict(recipeName, dietaryStyle, null)) {
      return true
    }

    // Check against excluded ingredients (foods_to_avoid)
    if (params.excludeIngredients && params.excludeIngredients.length > 0) {
      const recipeNameLower = recipeName.toLowerCase()

      for (const ingredient of params.excludeIngredients) {
        const ingredientLower = ingredient.toLowerCase().trim()
        if (ingredientLower && recipeNameLower.includes(ingredientLower)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Check if a recipe's INGREDIENTS conflict with dietary preferences
   * This is a more thorough check after fetching full recipe details
   * Returns true if the recipe should be EXCLUDED
   */
  private hasIngredientConflict(
    recipe: NormalizedRecipe,
    params: MealPlanGenerationParams
  ): boolean {
    const dietaryStyle = params.dietaryPreferences?.[0] || null

    // Build a searchable string from all ingredients
    const ingredientText = recipe.ingredients
      .map(ing => `${ing.name} ${ing.description || ''}`.toLowerCase())
      .join(' ')

    // Also check the recipe title
    const recipeTitle = recipe.title.toLowerCase()
    const fullSearchText = `${recipeTitle} ${ingredientText}`

    // Meat proteins that vegetarians don't eat
    const meatProteins = [
      'chicken', 'turkey', 'duck', 'beef', 'steak', 'pork', 'lamb', 'veal',
      'brisket', 'ribs', 'bacon', 'sausage', 'ham', 'prosciutto', 'pepperoni',
      'salami', 'ground beef', 'ground pork', 'ground turkey', 'meatball',
      'hot dog', 'chorizo', 'pancetta', 'venison', 'bison', 'rabbit',
    ]

    // Seafood proteins
    const seafoodProteins = [
      'salmon', 'tuna', 'shrimp', 'fish', 'cod', 'tilapia', 'halibut',
      'crab', 'lobster', 'scallops', 'mussels', 'clams', 'seafood', 'prawn',
      'anchovy', 'sardine', 'trout', 'bass', 'mackerel', 'squid', 'calamari',
      'oyster', 'crawfish', 'crayfish',
    ]

    // All animal products (for vegan check)
    const animalProducts = [
      ...meatProteins,
      ...seafoodProteins,
      'egg', 'eggs', 'cheese', 'cream', 'butter', 'milk', 'yogurt', 'paneer',
      'ghee', 'whey', 'casein', 'gelatin', 'honey', 'lard',
    ]

    // Check dietary style conflicts in ingredients
    if (dietaryStyle) {
      switch (dietaryStyle) {
        case 'vegetarian':
          for (const meat of meatProteins) {
            if (fullSearchText.includes(meat)) {
              return true
            }
          }
          for (const seafood of seafoodProteins) {
            if (fullSearchText.includes(seafood)) {
              return true
            }
          }
          break

        case 'vegan':
          for (const animal of animalProducts) {
            if (fullSearchText.includes(animal)) {
              return true
            }
          }
          break

        case 'pescatarian':
          for (const meat of meatProteins) {
            if (fullSearchText.includes(meat)) {
              return true
            }
          }
          break

        case 'keto':
          for (const food of KETO_AVOID_FOODS) {
            if (fullSearchText.includes(food)) {
              return true
            }
          }
          break

        case 'paleo':
          for (const food of PALEO_AVOID_FOODS) {
            if (fullSearchText.includes(food)) {
              return true
            }
          }
          break

        case 'mediterranean':
          // Mediterranean is more flexible - mainly emphasizes certain foods
          break
      }
    }

    // Check excluded ingredients (foods_to_avoid)
    if (params.excludeIngredients && params.excludeIngredients.length > 0) {
      for (const excluded of params.excludeIngredients) {
        const excludedLower = excluded.toLowerCase().trim()
        if (excludedLower && fullSearchText.includes(excludedLower)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Build search terms based on meal type, macro preferences, and dietary restrictions
   */
  private buildSearchTerms(
    mealType: MealType,
    params: MealPlanGenerationParams
  ): string[] {
    const terms: string[] = []
    const dietaryStyle = params.dietaryPreferences?.[0] || null

    const isHighProtein = params.targetProtein > params.targetCalories * 0.15 / 4
    const isLowCarb = params.targetCarbs < params.targetCalories * 0.35 / 4

    // Add diet-specific search terms first (highest priority)
    switch (dietaryStyle) {
      case 'vegan':
        terms.push(...HIGH_PROTEIN_TERMS_VEGAN)
        break
      case 'vegetarian':
        terms.push(...HIGH_PROTEIN_TERMS_VEGETARIAN)
        break
      case 'pescatarian':
        terms.push(...HIGH_PROTEIN_TERMS_VEGETARIAN)
        terms.push('salmon', 'tuna', 'shrimp', 'fish')
        break
      case 'keto':
        terms.push(...KETO_SEARCH_TERMS)
        break
      case 'paleo':
        terms.push(...PALEO_SEARCH_TERMS)
        break
      case 'mediterranean':
        terms.push(...MEDITERRANEAN_SEARCH_TERMS)
        break
      default:
        // No dietary restriction - add protein terms based on macro goals
        if (isHighProtein) {
          terms.push(...HIGH_PROTEIN_TERMS_MEAT)
          terms.push(...HIGH_PROTEIN_TERMS_VEGETARIAN)
        }
        if (isLowCarb) {
          terms.push(...LOW_CARB_TERMS_MEAT)
          terms.push(...LOW_CARB_TERMS_VEGETARIAN)
        }
    }

    // Add meal-type specific terms based on dietary style
    switch (mealType) {
      case 'breakfast':
        switch (dietaryStyle) {
          case 'vegan':
            terms.push('tofu scramble', 'vegan breakfast', 'avocado toast', 'smoothie bowl', 'oatmeal')
            break
          case 'vegetarian':
            terms.push('eggs', 'omelette', 'vegetarian breakfast', 'pancakes', 'oatmeal')
            break
          case 'keto':
            terms.push('keto eggs', 'bacon eggs', 'avocado eggs', 'low carb breakfast')
            break
          case 'paleo':
            terms.push('paleo eggs', 'sweet potato hash', 'fruit breakfast', 'whole30 breakfast')
            break
          case 'mediterranean':
            terms.push('greek yogurt', 'mediterranean eggs', 'olive oil breakfast')
            break
          default:
            terms.push(isHighProtein ? 'eggs' : 'oatmeal', isHighProtein ? 'omelette' : 'smoothie bowl', 'breakfast')
        }
        break

      case 'lunch':
        switch (dietaryStyle) {
          case 'vegan':
            terms.push('vegan salad', 'lentil soup', 'buddha bowl', 'falafel', 'veggie wrap')
            break
          case 'vegetarian':
            terms.push('vegetarian salad', 'cheese sandwich', 'veggie wrap', 'soup', 'bowl')
            break
          case 'keto':
            terms.push('keto salad', 'bunless burger', 'lettuce wrap', 'low carb lunch')
            break
          case 'paleo':
            terms.push('paleo salad', 'grilled chicken salad', 'paleo wrap', 'whole30 lunch')
            break
          case 'mediterranean':
            terms.push('greek salad', 'hummus plate', 'mediterranean bowl', 'falafel wrap')
            break
          default:
            terms.push(isHighProtein ? 'chicken salad' : 'salad', isHighProtein ? 'grilled chicken' : 'soup', 'wrap', 'bowl')
        }
        break

      case 'dinner':
        switch (dietaryStyle) {
          case 'vegan':
            terms.push('tofu stir fry', 'vegan curry', 'lentil dinner', 'vegetable stew', 'vegan pasta')
            break
          case 'vegetarian':
            terms.push('vegetarian dinner', 'paneer curry', 'veggie stir fry', 'pasta', 'roasted vegetables')
            break
          case 'keto':
            terms.push('keto steak', 'grilled salmon', 'cauliflower rice', 'low carb dinner')
            break
          case 'paleo':
            terms.push('paleo steak', 'grilled salmon', 'roasted vegetables', 'whole30 dinner')
            break
          case 'mediterranean':
            terms.push('grilled fish', 'mediterranean chicken', 'olive oil salmon', 'greek dinner')
            break
          default:
            terms.push(isHighProtein ? 'grilled salmon' : 'stir fry', isHighProtein ? 'chicken breast' : 'pasta', 'roasted')
        }
        break

      case 'snack':
        switch (dietaryStyle) {
          case 'vegan':
            terms.push('vegan snack', 'hummus', 'fruit', 'nuts', 'energy balls')
            break
          case 'vegetarian':
            terms.push('protein', 'cottage cheese', 'yogurt', 'nuts', 'smoothie')
            break
          case 'keto':
            terms.push('keto snack', 'cheese', 'nuts', 'fat bomb', 'pork rinds')
            break
          case 'paleo':
            terms.push('paleo snack', 'nuts', 'fruit', 'beef jerky', 'vegetables')
            break
          case 'mediterranean':
            terms.push('olives', 'hummus', 'nuts', 'greek yogurt', 'fruit')
            break
          default:
            terms.push(isHighProtein ? 'protein' : 'fruit', isHighProtein ? 'cottage cheese' : 'yogurt', 'nuts', 'smoothie')
        }
        break
    }

    // Add explicit dietary preference terms for better API matching
    if (dietaryStyle && dietaryStyle !== 'none') {
      terms.push(dietaryStyle)
    }

    return this.shuffleArray(terms)
  }

  /**
   * Calculate macro targets for each meal type
   */
  private calculateMealTargets(params: MealPlanGenerationParams): Record<MealType, { calories: number; protein: number; carbs: number; fat: number }> {
    const mealsPerDay = params.mealsPerDay || 4
    const snackCount = Math.max(0, mealsPerDay - 3)

    let breakfast = 0.25
    let lunch = 0.30
    let dinner = 0.30
    let snackTotal = 0.15

    if (mealsPerDay === 3) {
      breakfast = 0.28
      lunch = 0.36
      dinner = 0.36
      snackTotal = 0
    } else if (snackCount > 0) {
      snackTotal = snackCount * 0.10
      const mainMealReduction = (snackTotal - 0.15) / 3
      breakfast = 0.25 - mainMealReduction
      lunch = 0.30 - mainMealReduction
      dinner = 0.30 - mainMealReduction
    }

    return {
      breakfast: {
        calories: Math.round(params.targetCalories * breakfast),
        protein: Math.round(params.targetProtein * breakfast),
        carbs: Math.round(params.targetCarbs * breakfast),
        fat: Math.round(params.targetFat * breakfast),
      },
      lunch: {
        calories: Math.round(params.targetCalories * lunch),
        protein: Math.round(params.targetProtein * lunch),
        carbs: Math.round(params.targetCarbs * lunch),
        fat: Math.round(params.targetFat * lunch),
      },
      dinner: {
        calories: Math.round(params.targetCalories * dinner),
        protein: Math.round(params.targetProtein * dinner),
        carbs: Math.round(params.targetCarbs * dinner),
        fat: Math.round(params.targetFat * dinner),
      },
      snack: {
        calories: Math.round(params.targetCalories * snackTotal),
        protein: Math.round(params.targetProtein * snackTotal),
        carbs: Math.round(params.targetCarbs * snackTotal),
        fat: Math.round(params.targetFat * snackTotal),
      },
    }
  }

  private getSnackInsertPosition(snackIndex: number, _totalSnacks: number, currentLength: number): number {
    const positions = [2, 1, currentLength]
    return Math.min(positions[snackIndex] ?? currentLength, currentLength)
  }

  private calculateTotals(meals: MealSlotWithMultiplier[]): {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  } {
    return meals.reduce(
      (totals, meal) => {
        if (meal.recipe) {
          totals.totalCalories += meal.recipe.adjustedCalories
          totals.totalProtein += meal.recipe.adjustedProtein
          totals.totalCarbs += meal.recipe.adjustedCarbs
          totals.totalFat += meal.recipe.adjustedFat
        }
        return totals
      },
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    )
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  validateMacroMatch(
    target: number,
    actual: number
  ): { isWithinTolerance: boolean; percentDiff: number } {
    const diff = Math.abs(actual - target)
    const percentDiff = (diff / target) * 100

    return {
      isWithinTolerance: percentDiff <= 15,
      percentDiff: Math.round(percentDiff * 10) / 10,
    }
  }
}

export const mealPlanGeneratorService = new MealPlanGeneratorService()
export { MealPlanGeneratorService }
