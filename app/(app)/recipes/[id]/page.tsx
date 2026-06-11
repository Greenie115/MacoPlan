import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RecipeHero } from '@/components/recipes/recipe-hero'
import { RecipeMacrosCard } from '@/components/recipes/recipe-macros-card'
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients'
import { RecipeInstructions } from '@/components/recipes/recipe-instructions'
import { RecipeNutritionFacts } from '@/components/recipes/recipe-nutrition-facts'
import { LogRecipeButton } from '@/components/recipes/log-recipe-button'
import { FavoriteButton } from '@/components/recipes/favorite-button'
import { RecipeNutritionCard } from '@/components/recipes/recipe-nutrition-card'
import { RecipeWithDetails } from '@/lib/types/recipe'
import { getRecipeDetails } from '@/app/actions/recipe-search'
import { getMealPlanMealInfo } from '@/app/actions/meal-plans'
import { getLoggedMealForRecipe } from '@/app/actions/meal-logs'
import { isRecipeFavorite } from '@/app/actions/recipes'
import { RecipeImageFallback } from '@/components/recipes/recipe-image-fallback'
import { z } from 'zod'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  Moon,
  UtensilsCrossed,
  Refrigerator,
  Snowflake,
  ChefHat,
  Lightbulb,
  Wrench,
} from 'lucide-react'

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ mealId?: string }>
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

  // Try local recipe first
  const { data: localRecipe } = await supabase
    .from('recipes')
    .select('title, description')
    .eq('id', validationResult.data.id)
    .single()

  if (localRecipe) {
    return {
      title: localRecipe.title,
      description: localRecipe.description || `View the full recipe for ${localRecipe.title} with nutritional information and macro breakdown.`,
      alternates: { canonical: `/recipes/${validationResult.data.id}` },
    }
  }

  // Fall back to Recipe-API.com
  const apiResult = await getRecipeDetails(validationResult.data.id)
  if (apiResult.success && apiResult.data) {
    return {
      title: apiResult.data.title,
      description: apiResult.data.description || `View the full recipe for ${apiResult.data.title} with nutritional information.`,
      alternates: { canonical: `/recipes/${validationResult.data.id}` },
    }
  }

  return { title: 'Recipe Not Found' }
}

export default async function RecipePage({ params, searchParams }: RecipePageProps) {
  const resolvedParams = await params
  const { mealId } = await searchParams

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

  if (recipeError && recipeError.code !== 'PGRST116') {
    console.error('RecipePage: Error fetching recipe:', recipeError)
  }

  // If not a local recipe, try Recipe-API.com
  if (!recipe) {
    return RecipeApiDetailPage({ id, mealId })
  }

  // Sort ingredients and instructions in JS since Supabase ordering on nested relations can be tricky
  const ingredients = (recipe.recipe_ingredients || []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  )
  const instructions = (recipe.recipe_instructions || []).sort(
    (a: { step_number: number }, b: { step_number: number }) => a.step_number - b.step_number
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

/**
 * Recipe detail page for Recipe-API.com recipes
 * Rendered when the recipe is not found in the local Supabase database
 */
async function RecipeApiDetailPage({ id, mealId }: { id: string; mealId?: string }) {
  const result = await getRecipeDetails(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const recipe = result.data

  // Check if recipe is favorited and if already logged today
  const [isFavorited, loggedMealResult] = await Promise.all([
    isRecipeFavorite(id),
    getLoggedMealForRecipe(id),
  ])
  const loggedMealId = loggedMealResult.mealId

  // If linked from a meal plan, fetch the meal info for current multiplier
  let mealPlanMealInfo: {
    id: string
    mealPlanId: string
    servingMultiplier: number
  } | null = null

  if (mealId) {
    const mealResult = await getMealPlanMealInfo(mealId)
    if (mealResult.success && mealResult.data) {
      mealPlanMealInfo = {
        id: mealResult.data.id,
        mealPlanId: mealResult.data.mealPlanId,
        servingMultiplier: mealResult.data.servingMultiplier,
      }
    }
  }

  // JSON-LD structured data for recipe rich results.
  // Recipe content comes from an external API, so `<` is escaped to prevent
  // </script> breakout when serialized into the inline script tag.
  const jsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'Recipe' as const,
    name: recipe.title,
    description: recipe.description || `Recipe for ${recipe.title}`,
    ...(recipe.imageUrl && { image: recipe.imageUrl }),
    ...(recipe.totalTimeMinutes && { totalTime: `PT${recipe.totalTimeMinutes}M` }),
    ...(recipe.yields && { recipeYield: recipe.yields }),
    ...(recipe.categories[0] && { recipeCategory: recipe.categories[0] }),
    ...(recipe.cuisine && { recipeCuisine: recipe.cuisine }),
    ...(recipe.recipeTypes.length > 0 && { keywords: recipe.recipeTypes.join(', ') }),
    nutrition: {
      '@type': 'NutritionInformation' as const,
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein}g`,
      carbohydrateContent: `${recipe.carbs}g`,
      fatContent: `${recipe.fat}g`,
    },
    recipeIngredient: recipe.ingredients.map((i) => i.description || i.name),
    recipeInstructions: recipe.instructions.map((step) => ({
      '@type': 'HowToStep' as const,
      position: step.stepNumber,
      text: step.instruction,
    })),
  }
  const jsonLdScript = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <div className="min-h-screen bg-background pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link
            href={mealPlanMealInfo ? `/meal-plans/${mealPlanMealInfo.mealPlanId}` : '/recipes'}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">
              {mealPlanMealInfo ? 'Back to Meal Plan' : 'Back to Recipes'}
            </span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Recipe Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <RecipeImageFallback title={recipe.title} />
          )}
        </div>

        {/* Recipe Title with Log Button */}
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex-1">
            {recipe.title}
          </h1>
          <LogRecipeButton
            recipe={{
              id: '',
              name: recipe.title,
              calories: recipe.calories,
              protein_grams: recipe.protein,
              carb_grams: recipe.carbs,
              fat_grams: recipe.fat,
              servings: recipe.servings,
            }}
            loggedMealId={loggedMealId}
            variant="outline"
            size="sm"
            className="rounded-full px-4 shrink-0"
          />
        </div>

        {/* Category / cuisine / difficulty / dietary badges */}
        {(recipe.categories.some(Boolean) || recipe.cuisine || recipe.difficulty || (recipe.dietaryFlags?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.categories.filter(Boolean).map((category) => (
              <span key={category} className="bg-primary/10 text-primary font-semibold text-xs py-1.5 px-3 rounded-full">
                {category}
              </span>
            ))}
            {recipe.cuisine && (
              <span className="bg-primary/10 text-primary font-semibold text-xs py-1.5 px-3 rounded-full">
                {recipe.cuisine}
              </span>
            )}
            {recipe.difficulty && (
              <span className="bg-muted text-muted-foreground font-semibold text-xs py-1.5 px-3 rounded-full">
                {recipe.difficulty}
              </span>
            )}
            {recipe.dietaryFlags?.map((flag) => (
              <span key={flag} className="bg-success/10 text-success font-semibold text-xs py-1.5 px-3 rounded-full">
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {recipe.description && (
          <p className="text-muted-foreground leading-relaxed mb-6">{recipe.description}</p>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-sm">
          {recipe.yields ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4 text-icon" />
              <span>{recipe.yields}</span>
            </div>
          ) : recipe.servings ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4 text-icon" />
              <span>{recipe.servings} servings</span>
            </div>
          ) : null}
          {recipe.prepTimeMinutes ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 text-icon" />
              <span>{recipe.prepTimeMinutes} min active</span>
            </div>
          ) : null}
          {recipe.cookTimeMinutes ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="size-4 text-icon" />
              <span>{recipe.cookTimeMinutes} min passive</span>
            </div>
          ) : null}
          {recipe.totalTimeMinutes ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 text-icon" />
              <span>{recipe.totalTimeMinutes} min total</span>
            </div>
          ) : null}
          {recipe.overnightRequired && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="size-4 text-icon" />
              <span>Overnight required</span>
            </div>
          )}
        </div>

        {/* Nutrition Info with Serving Adjuster */}
        <div className="mb-6">
          <RecipeNutritionCard
            calories={recipe.calories}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fat={recipe.fat}
            servings={recipe.servings}
            mealId={mealPlanMealInfo?.id}
            mealPlanId={mealPlanMealInfo?.mealPlanId}
            initialMultiplier={mealPlanMealInfo?.servingMultiplier ?? 1.0}
          />
        </div>

        {/* Equipment */}
        {(recipe.equipment?.length ?? 0) > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-primary" />
              Equipment
            </h2>
            <ul className="space-y-2">
              {recipe.equipment!.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary font-medium">•</span>
                  <span>
                    {item.name}
                    {!item.required && <span className="text-muted-foreground text-sm"> (optional)</span>}
                    {item.alternative && (
                      <span className="text-muted-foreground text-sm"> — or use {item.alternative}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ingredients (grouped) */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Ingredients</h2>
            {(recipe.ingredientGroups?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {recipe.ingredientGroups!.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {recipe.ingredientGroups!.length > 1 && group.groupName && (
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                        {group.groupName}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {group.items.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2 text-foreground">
                          <span className="text-primary font-medium">•</span>
                          <span>
                            {ingredient.description || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                            {ingredient.notes && (
                              <span className="block text-sm text-muted-foreground">{ingredient.notes}</span>
                            )}
                            {ingredient.substitutions.length > 0 && (
                              <span className="block text-sm text-muted-foreground">
                                Swap: {ingredient.substitutions.join(', ')}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground">
                    <span className="text-primary font-medium">•</span>
                    <span>{ingredient.description || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Instructions with phases and tips */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Instructions</h2>
            <ol className="space-y-5">
              {recipe.instructions.map((step, index) => {
                const prevPhase = index > 0 ? recipe.instructions[index - 1].phase : undefined
                const showPhase = step.phase && step.phase !== prevPhase
                return (
                  <li key={step.stepNumber || index}>
                    {showPhase && (
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 ml-9">
                        {step.phase}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {step.stepNumber || index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-foreground">{step.instruction}</p>
                        {(step.tips?.length ?? 0) > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {step.tips!.map((tip, tipIndex) => (
                              <p key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                                <Lightbulb className="size-4 shrink-0 mt-0.5 text-warning" />
                                <span>{tip}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Storage & Reheating */}
        {recipe.storage && (recipe.storage.refrigerator || recipe.storage.freezer || recipe.storage.reheating || recipe.storage.doesNotKeep) && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Refrigerator className="size-5 text-primary" />
              Storage &amp; Meal Prep
            </h2>
            <div className="space-y-3 text-sm">
              {recipe.storage.doesNotKeep && (
                <p className="text-warning font-medium">Best eaten fresh — this recipe doesn&apos;t keep well.</p>
              )}
              {recipe.storage.refrigerator && (
                <div className="flex items-start gap-2">
                  <Refrigerator className="size-4 shrink-0 mt-0.5 text-icon" />
                  <p className="text-foreground">
                    <span className="font-semibold">Fridge: {recipe.storage.refrigerator.duration}.</span>{' '}
                    <span className="text-muted-foreground">{recipe.storage.refrigerator.notes}</span>
                  </p>
                </div>
              )}
              {recipe.storage.freezer && (
                <div className="flex items-start gap-2">
                  <Snowflake className="size-4 shrink-0 mt-0.5 text-icon" />
                  <p className="text-foreground">
                    <span className="font-semibold">Freezer: {recipe.storage.freezer.duration}.</span>{' '}
                    <span className="text-muted-foreground">{recipe.storage.freezer.notes}</span>
                  </p>
                </div>
              )}
              {recipe.storage.reheating && (
                <div className="flex items-start gap-2">
                  <Flame className="size-4 shrink-0 mt-0.5 text-icon" />
                  <p className="text-foreground">
                    <span className="font-semibold">Reheating:</span>{' '}
                    <span className="text-muted-foreground">{recipe.storage.reheating}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chef Notes */}
        {(recipe.chefNotes?.length ?? 0) > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <ChefHat className="size-5 text-primary" />
              Chef&apos;s Notes
            </h2>
            <ul className="space-y-2">
              {recipe.chefNotes!.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed">
                  <span className="text-primary font-medium">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Troubleshooting */}
        {(recipe.troubleshooting?.length ?? 0) > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wrench className="size-5 text-primary" />
              Troubleshooting
            </h2>
            <div className="space-y-4">
              {recipe.troubleshooting!.map((item, index) => (
                <div key={index} className="text-sm">
                  <p className="font-semibold text-foreground">{item.symptom}</p>
                  <p className="text-muted-foreground mt-1">
                    <span className="font-medium text-foreground/80">Why:</span> {item.likelyCause}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground/80">Fix:</span> {item.fix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Nutrition Facts */}
        <div className="bg-card rounded-2xl border border-border-strong mb-6 overflow-hidden">
          <RecipeNutritionFacts
            servingSize={`1 serving (${recipe.servings || 1} total)`}
            calories={recipe.calories}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fat={recipe.fat}
            fiber={recipe.fiber ?? undefined}
            sugar={recipe.sugar ?? undefined}
            sodium={recipe.nutritionDetail?.sodium ?? undefined}
            cholesterol={recipe.nutritionDetail?.cholesterol ?? undefined}
            saturatedFat={recipe.nutritionDetail?.saturatedFat ?? undefined}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <FavoriteButton
            recipeId={id}
            initialIsFavorited={isFavorited}
            metadata={{
              title: recipe.title,
              description: recipe.description,
              imageUrl: recipe.imageUrl,
              calories: recipe.calories,
              protein: recipe.protein,
              carbs: recipe.carbs,
              fat: recipe.fat,
            }}
            variant="button"
            className="h-12"
          />
        </div>

        {/* Unsplash Attribution */}
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          Photos provided by{' '}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Unsplash
          </a>
        </div>
      </main>

    </div>
  )
}
