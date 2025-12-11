/**
 * Spoonacular Recipe Detail Page
 *
 * Displays detailed information for a recipe from the Spoonacular API
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'
import { getSpoonacularRecipeDetails } from '@/app/actions/spoonacular-recipes'
import { trackRecipeView } from '@/app/actions/recipe-tracking'
import { SpoonacularBadge } from '@/components/recipes/spoonacular-badge'
import { RecipeNutritionFacts } from '@/components/recipes/recipe-nutrition-facts'
import { getSpoonacularImageUrl } from '@/lib/utils/spoonacular-image'
import type { SpoonacularRecipe } from '@/lib/types/spoonacular'

/**
 * Strip HTML links and external references from Spoonacular content
 * Converts links to plain text while preserving the link text
 */
function stripLinksFromHtml(html: string): string {
  // Remove <a> tags but keep their inner text content
  let cleaned = html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')

  // Remove any remaining href attributes that might have slipped through
  cleaned = cleaned.replace(/href="[^"]*"/gi, '')

  // Remove common Spoonacular promotional phrases
  cleaned = cleaned.replace(/similar recipes include[^.]*\./gi, '')
  cleaned = cleaned.replace(/try (also )?[^.]*\./gi, '')
  cleaned = cleaned.replace(/if you like this recipe[^.]*\./gi, '')
  cleaned = cleaned.replace(/you might also like[^.]*\./gi, '')

  return cleaned
}

interface SpoonacularRecipePageProps {
  params: Promise<{ id: string }>
}

export default async function SpoonacularRecipePage({
  params,
}: SpoonacularRecipePageProps) {
  const { id } = await params
  const recipeId = parseInt(id, 10)

  if (isNaN(recipeId)) {
    notFound()
  }

  // Fetch recipe details
  const result = await getSpoonacularRecipeDetails(recipeId)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Recipe Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {result.error || 'Unable to load recipe details. Please try again.'}
        </p>
        <Link
          href="/recipes"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Recipes
        </Link>
      </div>
    )
  }

  const recipe = result.data

  // Track recipe view for recommendations (async, doesn't block render)
  trackRecipeView(recipe.id, recipe.title, 'spoonacular').catch((err) =>
    console.error('Failed to track recipe view:', err)
  )

  // Sanitize HTML content from Spoonacular API to prevent XSS
  // Also strip external links to keep users in the app
  const sanitizedSummary = recipe.summary
    ? DOMPurify.sanitize(stripLinksFromHtml(recipe.summary), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['class'],
        ALLOW_DATA_ATTR: false,
      })
    : ''

  const sanitizedInstructions = recipe.instructions
    ? DOMPurify.sanitize(stripLinksFromHtml(recipe.instructions), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['class'],
        ALLOW_DATA_ATTR: false,
      })
    : ''

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/recipes"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Recipes</span>
          </Link>
          <SpoonacularBadge size="md" />
        </div>
      </div>

      {/* Recipe Hero */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Recipe Image - Use 636x393 for high quality without watermark */}
          {recipe.id && (
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              <Image
                src={getSpoonacularImageUrl(recipe.id, '636x393')}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
                quality={95}
                priority
              />
            </div>
          )}

          {/* Recipe Title & Meta */}
          <div className="px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {recipe.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {recipe.readyInMinutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.readyInMinutes} min</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>

            {/* Diet Tags */}
            {recipe.diets && recipe.diets.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.diets.map((diet) => (
                  <span
                    key={diet}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md capitalize"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            )}

            {/* Summary - Links have been stripped for cleaner UX */}
            {sanitizedSummary && (
              <div
                className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Ingredients Section */}
        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.extendedIngredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium">
                      {ingredient.amount} {ingredient.unit}
                    </span>{' '}
                    {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions Section */}
        {recipe.analyzedInstructions &&
          recipe.analyzedInstructions.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Instructions
              </h2>
              {recipe.analyzedInstructions.map((instruction, instrIdx) => (
                <div key={instrIdx}>
                  {instruction.name && (
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {instruction.name}
                    </h3>
                  )}
                  <ol className="space-y-4">
                    {instruction.steps.map((step) => (
                      <li key={step.number} className="flex gap-4">
                        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                          {step.number}
                        </span>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-700 leading-relaxed">
                            {step.step}
                          </p>
                          {step.length && (
                            <p className="text-sm text-gray-500 mt-2">
                              Time: {step.length.number} {step.length.unit}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

        {/* Fallback for plain text instructions */}
        {sanitizedInstructions &&
          (!recipe.analyzedInstructions ||
            recipe.analyzedInstructions.length === 0) && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Instructions
              </h2>
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sanitizedInstructions }}
              />
            </div>
          )}

        {/* Nutrition Section */}
        {recipe.nutrition && recipe.nutrition.nutrients && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nutrition Facts
            </h2>
            <RecipeNutritionFacts
              servingSize={`1 of ${recipe.servings} servings`}
              calories={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Calories')?.amount || 0)}
              protein={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Protein')?.amount || 0)}
              carbs={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Carbohydrates')?.amount || 0)}
              fat={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Fat')?.amount || 0)}
              fiber={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Fiber')?.amount || 0)}
              sugar={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Sugar')?.amount || 0)}
              sodium={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Sodium')?.amount || 0)}
              cholesterol={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Cholesterol')?.amount || 0)}
              saturatedFat={Math.round(recipe.nutrition.nutrients.find((n) => n.name === 'Saturated Fat')?.amount || 0)}
            />
          </div>
        )}

        {/* Health Score */}
        {recipe.healthScore && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Health Score
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(recipe.healthScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(recipe.healthScore)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This recipe scores {Math.round(recipe.healthScore)} out of 100
                on the health scale. Higher scores indicate healthier recipes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
