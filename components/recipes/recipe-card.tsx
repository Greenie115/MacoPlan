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
  recipe: Recipe
  isFavorite: boolean
}

export function RecipeCard({ recipe, isFavorite }: RecipeCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to recipe detail
    e.stopPropagation()

    startTransition(() => {
      setOptimisticFavorite(!optimisticFavorite)
    })

    await toggleFavorite(recipe.id)
  }

  // Validate image URL for security
  const safeImageUrl = getSafeImageUrl(recipe.image_url)

  return (
    <Link href={`/recipes/${recipe.id}`} className="h-full block">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        {/* Recipe Image */}
        <div className="aspect-square w-full rounded-xl bg-gray-200 overflow-hidden relative shrink-0">
          {safeImageUrl ? (
            <Image
              src={safeImageUrl}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              onError={(e) => {
                // Fallback on image load error
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50"
            aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                optimisticFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Recipe Info */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-semibold text-base leading-tight text-gray-900 line-clamp-2 h-10">
            {recipe.name}
          </p>
          <p className="text-sm text-gray-500">{recipe.calories} cal</p>

          {/* Macros */}
          <div className="flex items-center gap-3 text-xs">
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: macroColors.protein.primary }}
            >
              {macroColors.protein.emoji} {recipe.protein_grams}g
            </span>
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: macroColors.carbs.primary }}
            >
              {macroColors.carbs.emoji} {recipe.carb_grams}g
            </span>
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: macroColors.fat.primary }}
            >
              {macroColors.fat.emoji} {recipe.fat_grams}g
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
