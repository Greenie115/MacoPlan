import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RecipeHero } from '@/components/recipes/recipe-hero'
import { RecipeMacrosCard } from '@/components/recipes/recipe-macros-card'
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients'
import { RecipeInstructions } from '@/components/recipes/recipe-instructions'
import { RecipeNutritionFacts } from '@/components/recipes/recipe-nutrition-facts'
import { RecipeWithDetails } from '@/lib/types/recipe'
import { isFavorite } from '../actions'
import { z } from 'zod'

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

  // Validate recipe ID parameter
  const validationResult = recipeParamsSchema.safeParse(resolvedParams)
  if (!validationResult.success) {
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
    .order('recipe_ingredients(order_index)', { ascending: true })
    .order('recipe_instructions(step_number)', { ascending: true })
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  const recipeWithDetails: RecipeWithDetails = {
    ...recipe,
    ingredients: recipe.recipe_ingredients || [],
    instructions: recipe.recipe_instructions || [],
    tags: recipe.recipe_tags || [],
  }

  // Check if recipe is favorited
  const isRecipeFavorite = await isFavorite(id)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Image with Back/Favorite Buttons */}
      <RecipeHero
        recipeId={recipe.id}
        imageUrl={recipe.image_url}
        recipeName={recipe.name}
        isFavorite={isRecipeFavorite}
      />

      {/* Recipe Title and Description */}
      <div className="px-4 py-6 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-base text-gray-600 mt-2">{recipe.description}</p>
        )}

        {/* Recipe Meta */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          {recipe.prep_time_minutes && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Prep:</span>
              <span>{recipe.prep_time_minutes} min</span>
            </div>
          )}
          {recipe.cook_time_minutes && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Cook:</span>
              <span>{recipe.cook_time_minutes} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Servings:</span>
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipeWithDetails.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipeWithDetails.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {tag.tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Macros Card with Servings Counter */}
      <RecipeMacrosCard
        initialMacros={{
          calories: recipe.calories,
          protein: recipe.protein_grams,
          carbs: recipe.carb_grams,
          fat: recipe.fat_grams,
        }}
        initialServings={recipe.servings || 1}
      />

      {/* Swap This Meal Button */}
      <div className="px-4 pb-6">
        <a
          href="/plans/generate"
          className="flex items-center justify-center w-full h-12 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Swap This Meal
        </a>
      </div>

      {/* Ingredients */}
      {recipeWithDetails.ingredients.length > 0 && (
        <div className="bg-white">
          <RecipeIngredients ingredients={recipeWithDetails.ingredients} />
        </div>
      )}

      {/* Instructions */}
      {recipeWithDetails.instructions.length > 0 && (
        <div className="bg-white mt-4">
          <RecipeInstructions instructions={recipeWithDetails.instructions} />
        </div>
      )}

      {/* Nutrition Facts */}
      <div className="bg-white mt-4">
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
    </div>
  )
}
