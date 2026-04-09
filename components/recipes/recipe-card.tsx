'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Recipe } from '@/lib/types/recipe'
import { macroColors } from '@/lib/design-tokens'
import { toggleRecipeFavorite } from '@/app/recipes/actions'
import { useOptimistic, useTransition } from 'react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'

interface RecipeCardProps {
  recipe: Recipe | any // Allow both local Recipe and Recipe-API recipe
  isFavorite: boolean
  source?: 'local' | 'recipe-api'
}

export function RecipeCard({ recipe, isFavorite, source = 'recipe-api' }: RecipeCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)

  // Get appropriate values based on source
  const recipeTitle = source === 'recipe-api' ? recipe.title : recipe.name
  const recipeImage = source === 'recipe-api' ? recipe.imageUrl : recipe.image_url

  // Get nutrition values
  const calories = source === 'recipe-api' ? recipe.calories : recipe.calories
  const protein = source === 'recipe-api' ? recipe.protein : recipe.protein_grams
  const carbs = source === 'recipe-api' ? recipe.carbs : recipe.carb_grams
  const fat = source === 'recipe-api' ? recipe.fat : recipe.fat_grams

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to recipe detail
    e.stopPropagation()

    // Only Recipe-API recipes support favoriting now
    if (source !== 'recipe-api') return

    startTransition(() => {
      setOptimisticFavorite(!optimisticFavorite)
    })

    // Pass metadata when adding to favorites
    const metadata = !optimisticFavorite
      ? {
          title: recipeTitle,
          description: recipe.description,
          imageUrl: recipeImage,
          calories,
          protein,
          carbs,
          fat,
        }
      : undefined

    await toggleRecipeFavorite(recipe.id, metadata)
  }

  const recipeLink = `/recipes/${recipe.id}`

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
              quality={90}
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
