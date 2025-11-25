import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RecipeHero } from '@/components/recipes/recipe-hero'
import { RecipeMacrosCard } from '@/components/recipes/recipe-macros-card'
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients'
import { RecipeInstructions } from '@/components/recipes/recipe-instructions'
import { RecipeNutritionFacts } from '@/components/recipes/recipe-nutrition-facts'
import { LogRecipeButton } from '@/components/recipes/log-recipe-button'
import { FavoriteButton } from '@/components/recipes/favorite-button'
import { RecipeWithDetails } from '@/lib/types/recipe'
import { isFavorite } from '../actions'
import { getLoggedMealForRecipe } from '@/app/actions/meal-logs'
import { z } from 'zod'
import { getRecipeFallback } from '@/lib/services/recipe-service'

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

// Validation schema for recipe ID param
const recipeParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid recipe ID format' }),
})

export default async function RecipePage({ params }: RecipePageProps) {
  const resolvedParams = await params
  console.log('RecipePage: Fetching recipe with ID:', resolvedParams.id)

  // Validate recipe ID parameter
  const validationResult = recipeParamsSchema.safeParse(resolvedParams)
  if (!validationResult.success) {
    console.error('RecipePage: Invalid ID format:', validationResult.error)
    notFound()
  }

  const { id } = validationResult.data
  const supabase = await createClient()

  // Fetch recipe with all related data in a single query
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        id,
        recipe_id,
        ingredient,
        amount,
        unit,
        order_index,
        created_at
      ),
      recipe_instructions (
        id,
        recipe_id,
        step_number,
        instruction,
        created_at
      ),
      recipe_tags (
        id,
        recipe_id,
        tag,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (recipeError) {
    console.error('RecipePage: Error fetching recipe:', recipeError)
  }

  if (!recipe) {
    console.log('RecipePage: Recipe not found for ID:', id)
    notFound()
  }

  // Sort ingredients and instructions in JS since Supabase ordering on nested relations can be tricky
  let ingredients = (recipe.recipe_ingredients || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )
  let instructions = (recipe.recipe_instructions || []).sort(
    (a: any, b: any) => a.step_number - b.step_number
  )

  // Fallback logic: If ingredients or instructions are missing, try to fetch them
  if (ingredients.length === 0 || instructions.length === 0) {
    const fallbackData = await getRecipeFallback(recipe.name)
    
    if (fallbackData) {
      if (ingredients.length === 0 && fallbackData.ingredients) {
        ingredients = fallbackData.ingredients
      }
      if (instructions.length === 0 && fallbackData.instructions) {
        instructions = fallbackData.instructions
      }
    }
  }

  const recipeWithDetails: RecipeWithDetails = {
    ...recipe,
    ingredients,
    instructions,
    tags: recipe.recipe_tags || [],
  }

  // Check if recipe is favorited
  const isRecipeFavorite = await isFavorite(id)

  // Check if recipe is already logged today
  const { mealId: loggedMealId } = await getLoggedMealForRecipe(id)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Image with Back/Favorite Buttons */}
      <RecipeHero
        recipeId={recipe.id}
        imageUrl={recipe.image_url}
        recipeName={recipe.name}
        isFavorite={isRecipeFavorite}
      />

      <div className="flex flex-col gap-6 -mt-8 relative z-10 px-4 max-w-4xl mx-auto w-full">
        {/* Title & Meta Card */}
        <div className="bg-white rounded-t-2xl pt-6 pb-2 shadow-sm">
          <h1 className="text-gray-900 tracking-tight text-3xl font-bold leading-tight px-4 text-left pb-2">
            {recipe.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-700 text-sm font-medium leading-normal pb-3 pt-1 px-4">
            {/* Rating placeholder since we don't have ratings yet */}
            <span>⭐ 4.5 (120 ratings)</span>
            <span>|</span>
            <span>🕐 {recipe.cook_time_minutes || recipe.prep_time_minutes || 25} min</span>
          </div>
        </div>

        {/* Macros Card */}
        <RecipeMacrosCard
          initialMacros={{
            calories: recipe.calories,
            protein: recipe.protein_grams,
            carbs: recipe.carb_grams,
            fat: recipe.fat_grams,
          }}
          initialServings={recipe.servings || 1}
        />

        {/* Tags */}
        {recipeWithDetails.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipeWithDetails.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary/20 text-primary font-semibold text-xs py-1.5 px-3 rounded-full"
              >
                {tag.tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        {recipeWithDetails.ingredients.length > 0 && (
          <RecipeIngredients ingredients={recipeWithDetails.ingredients} />
        )}

        {/* Instructions */}
        {recipeWithDetails.instructions.length > 0 && (
          <RecipeInstructions instructions={recipeWithDetails.instructions} />
        )}

        {/* Nutrition Facts */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <RecipeNutritionFacts
            servingSize={`1 serving (${recipe.servings || 1} total)`}
            calories={recipe.calories}
            protein={recipe.protein_grams}
            carbs={recipe.carb_grams}
            fat={recipe.fat_grams}
            fiber={recipe.fiber_grams || undefined}
            sugar={recipe.sugar_grams || undefined}
            sodium={recipe.sodium_mg || undefined}
            cholesterol={recipe.cholesterol_mg || undefined}
            saturatedFat={recipe.saturated_fat_grams || undefined}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2 pb-6">
          <LogRecipeButton
            recipe={{
              id: recipe.id,
              name: recipe.name,
              calories: recipe.calories,
              protein_grams: recipe.protein_grams,
              carb_grams: recipe.carb_grams,
              fat_grams: recipe.fat_grams,
              servings: recipe.servings,
            }}
            loggedMealId={loggedMealId}
            className="h-12 text-base"
          />
          <FavoriteButton
            recipeId={recipe.id}
            initialIsFavorited={isRecipeFavorite}
            variant="button"
            className="h-12 text-base"
          />
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs text-gray-400">Recipe data powered by</span>
            <span className="text-sm font-bold text-gray-500">Edamam</span>
          </div>
        </div>
      </div>
    </div>
  )
}
