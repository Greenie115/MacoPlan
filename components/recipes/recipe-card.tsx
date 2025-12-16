'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Recipe } from '@/lib/types/recipe'
import { macroColors } from '@/lib/design-tokens'
import { toggleFavorite } from '@/app/recipes/actions'
import { useOptimistic, useTransition } from 'react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'

interface RecipeCardProps {
  recipe: Recipe | any // Allow both local Recipe and FatSecret recipe
  isFavorite: boolean
  source?: 'local' | 'fatsecret'
}

export function RecipeCard({ recipe, isFavorite, source = 'local' }: RecipeCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to recipe detail
    e.stopPropagation()

    startTransition(() => {
      setOptimisticFavorite(!optimisticFavorite)
    })

    // Call favorite action for local recipes
    // FatSecret favorites can be added later if needed
    if (source === 'local') {
      await toggleFavorite(recipe.id)
    }
  }

  // Get appropriate values based on source
  const recipeTitle = source === 'fatsecret' ? recipe.title : recipe.name
  const recipeImage = source === 'fatsecret' ? recipe.imageUrl : recipe.image_url
  const recipeLink = source === 'fatsecret' ? `/recipes/fatsecret/${recipe.id}` : `/recipes/${recipe.id}`

  // Get nutrition values
  const calories = source === 'fatsecret' ? recipe.calories : recipe.calories
  const protein = source === 'fatsecret' ? recipe.protein : recipe.protein_grams
  const carbs = source === 'fatsecret' ? recipe.carbs : recipe.carb_grams
  const fat = source === 'fatsecret' ? recipe.fat : recipe.fat_grams

  // Validate image URL for security
  const safeImageUrl = getSafeImageUrl(recipeImage)

  return (
    <Link href={recipeLink} className="h-full block" prefetch={false}>
      <div className="flex flex-col gap-4 rounded-2xl border border-border-strong bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        {/* Recipe Image */}
        <div className="aspect-square w-full rounded-xl bg-muted overflow-hidden relative shrink-0">
          {safeImageUrl ? (
            <Image
              src={safeImageUrl}
              alt={recipeTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              quality={85}
              onError={(e) => {
                // Fallback on image load error
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className="absolute top-2 right-2 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-md hover:bg-card transition-colors disabled:opacity-50"
            aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                optimisticFavorite
                  ? 'fill-primary text-primary'
                  : 'text-icon'
              }`}
            />
          </button>
        </div>

        {/* Recipe Info */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-semibold text-base leading-tight text-foreground line-clamp-2 h-10">
            {recipeTitle}
          </p>
          <p className="text-sm text-muted-foreground">{Math.round(calories)} cal</p>

          {/* Macros */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-medium px-2 py-1 rounded-full bg-protein/10 text-protein">
              {macroColors.protein.emoji} {Math.round(protein)}g
            </span>
            <span className="flex items-center gap-1 font-medium px-2 py-1 rounded-full bg-carb/10 text-carb">
              {macroColors.carbs.emoji} {Math.round(carbs)}g
            </span>
            <span className="flex items-center gap-1 font-medium px-2 py-1 rounded-full bg-fat/10 text-fat">
              {macroColors.fat.emoji} {Math.round(fat)}g
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
