import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RecipeHero } from '@/components/recipes/recipe-hero'
import { RecipeMacrosCard } from '@/components/recipes/recipe-macros-card'
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients'
import { RecipeInstructions } from '@/components/recipes/recipe-instructions'
import { RecipeNutritionFacts } from '@/components/recipes/recipe-nutrition-facts'
import { LogRecipeButton } from '@/components/recipes/log-recipe-button'
import { RecipeWithDetails } from '@/lib/types/recipe'
import { getLoggedMealForRecipe } from '@/app/actions/meal-logs'
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

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params
  const validationResult = recipeParamsSchema.safeParse({ id })
  if (!validationResult.success) {
    return { title: 'Recipe Not Found' }
  }

  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description')
    .eq('id', validationResult.data.id)
    .single()

  if (!recipe) {
    return { title: 'Recipe Not Found' }
  }

  return {
    title: recipe.title,
    description: recipe.description || `View the full recipe for ${recipe.title} with nutritional information and macro breakdown.`,
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const resolvedParams = await params

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
    notFound()
  }

  // Sort ingredients and instructions in JS since Supabase ordering on nested relations can be tricky
  const ingredients = (recipe.recipe_ingredients || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )
  const instructions = (recipe.recipe_instructions || []).sort(
    (a: any, b: any) => a.step_number - b.step_number
  )

  const recipeWithDetails: RecipeWithDetails = {
    ...recipe,
    ingredients,
    instructions,
    tags: recipe.recipe_tags || [],
  }

  // JSON-LD structured data for recipe rich results
  const jsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'Recipe' as const,
    name: recipe.name,
    description: recipe.description || `Recipe for ${recipe.name}`,
    ...(recipe.image_url && { image: recipe.image_url }),
    prepTime: recipe.prep_time_minutes ? `PT${recipe.prep_time_minutes}M` : undefined,
    cookTime: recipe.cook_time_minutes ? `PT${recipe.cook_time_minutes}M` : undefined,
    totalTime: recipe.total_time_minutes ? `PT${recipe.total_time_minutes}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipeWithDetails.tags.length > 0
      ? recipeWithDetails.tags.map((t) => t.tag).join(', ')
      : undefined,
    nutrition: {
      '@type': 'NutritionInformation' as const,
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein_grams}g`,
      carbohydrateContent: `${recipe.carb_grams}g`,
      fatContent: `${recipe.fat_grams}g`,
      ...(recipe.fiber_grams && { fiberContent: `${recipe.fiber_grams}g` }),
      ...(recipe.sugar_grams && { sugarContent: `${recipe.sugar_grams}g` }),
      ...(recipe.sodium_mg && { sodiumContent: `${recipe.sodium_mg}mg` }),
      ...(recipe.cholesterol_mg && { cholesterolContent: `${recipe.cholesterol_mg}mg` }),
      ...(recipe.saturated_fat_grams && { saturatedFatContent: `${recipe.saturated_fat_grams}g` }),
    },
    recipeIngredient: recipeWithDetails.ingredients.map(
      (i) => [i.amount, i.unit, i.ingredient].filter(Boolean).join(' ')
    ),
    recipeInstructions: recipeWithDetails.instructions.map((step) => ({
      '@type': 'HowToStep' as const,
      position: step.step_number,
      text: step.instruction,
    })),
  }

  // Check if recipe is already logged today
  const { mealId: loggedMealId } = await getLoggedMealForRecipe(id)

  return (
    <>
      {/* JSON-LD structured data for recipe rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background pb-20">
      {/* Hero Image with Back Button */}
      <RecipeHero
        recipeId={recipe.id}
        imageUrl={recipe.image_url}
        recipeName={recipe.name}
        isFavorite={false}
      />

      <div className="flex flex-col gap-6 -mt-8 relative z-10 px-4 max-w-4xl mx-auto w-full">
        {/* Title & Meta Card */}
        <div className="bg-card rounded-t-2xl pt-6 pb-2 shadow-sm border border-border-strong">
          <h1 className="text-foreground tracking-tight text-3xl font-bold leading-tight px-4 text-left pb-2">
            {recipe.name}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium leading-normal pb-3 pt-1 px-4">
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
                className="bg-primary/10 text-primary font-semibold text-xs py-1.5 px-3 rounded-full"
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
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border-strong">
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
        </div>
      </div>
    </div>
    </>
  )
}
