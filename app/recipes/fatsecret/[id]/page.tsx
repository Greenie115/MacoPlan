import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, ExternalLink } from 'lucide-react'
import { getRecipeDetails } from '@/app/actions/fatsecret-recipes'
import { getMealPlanMealInfo } from '@/app/actions/meal-plans'
import { isFatSecretFavorite } from '@/app/recipes/actions'
import { TopAppBar } from '@/components/layout/top-app-bar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RecipeNutritionCard } from '@/components/recipes/recipe-nutrition-card'
import { FavoriteButton } from '@/components/recipes/favorite-button'
import { createClient } from '@/lib/supabase/server'

interface FatSecretRecipePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mealId?: string }>
}

export default async function FatSecretRecipePage({ params, searchParams }: FatSecretRecipePageProps) {
  const { id } = await params
  const { mealId } = await searchParams

  // Fetch recipe details from FatSecret
  const result = await getRecipeDetails(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const recipe = result.data

  // Check if recipe is favorited
  const isFavorited = await isFatSecretFavorite(id)

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

  // Fetch user profile for header
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userName = 'User'
  let avatarUrl: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      userName = profile.full_name || user.email?.split('@')[0] || 'User'
      avatarUrl = profile.avatar_url
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopAppBar userName={userName} avatarUrl={avatarUrl} />

      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
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
        {recipe.imageUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Recipe Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {recipe.title}
        </h1>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          {recipe.servings && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-5 text-icon" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          {recipe.totalTimeMinutes && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-5 text-icon" />
              <span>{recipe.totalTimeMinutes} min</span>
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

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary font-medium">•</span>
                  <span>{ingredient.description || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="bg-card rounded-2xl border border-border-strong p-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={step.stepNumber || index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {step.stepNumber || index + 1}
                  </span>
                  <p className="text-foreground">{step.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="size-4" />
              View Original Recipe
            </a>
          )}
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

        {/* FatSecret Attribution - Required by API Terms */}
        <div className="mt-8 pt-6 border-t border-border flex justify-center">
          <a href="https://www.fatsecret.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.svg"
              alt="Powered by fatsecret"
              className="h-5 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </main>

      <BottomNav activeTab="recipes" />
    </div>
  )
}
