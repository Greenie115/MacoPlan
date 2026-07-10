'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { toggleRecipeFavorite } from '@/app/actions/recipes'
import { useOptimistic, useState, useTransition } from 'react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'
import { RecipeImageFallback } from './recipe-image-fallback'

/**
 * Card data arrives from three sources with different field names and
 * varying completeness (Recipe-API search results, the local `recipes`
 * table, and the session cache). The card normalizes via fallbacks.
 */
export interface RecipeCardData {
  id: string | number
  title?: string
  name?: string
  description?: string
  imageUrl?: string | null
  image_url?: string | null
  calories?: number
  protein?: number
  protein_grams?: number
  carbs?: number
  carb_grams?: number
  fat?: number
  fat_grams?: number
}

interface RecipeCardProps {
  recipe: RecipeCardData
  isFavorite: boolean
  source?: 'local' | 'recipe-api'
}

export function RecipeCard({ recipe, isFavorite, source = 'recipe-api' }: RecipeCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)
  const [imageFailed, setImageFailed] = useState(false)

  // Normalize the two shapes (Recipe-API uses title/imageUrl/protein,
  // local rows use name/image_url/protein_grams)
  const recipeTitle = recipe.title ?? recipe.name ?? 'Recipe'
  const recipeImage = recipe.imageUrl ?? recipe.image_url ?? null
  const calories = recipe.calories ?? 0
  const protein = recipe.protein ?? recipe.protein_grams ?? 0
  const carbs = recipe.carbs ?? recipe.carb_grams ?? 0
  const fat = recipe.fat ?? recipe.fat_grams ?? 0

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

    await toggleRecipeFavorite(String(recipe.id), metadata)
  }

  const recipeLink = `/recipes/${recipe.id}`

  // Validate image URL for security
  const safeImageUrl = getSafeImageUrl(recipeImage)
  const showImage = safeImageUrl && !imageFailed

  return (
    <Link href={recipeLink} className="h-full block" prefetch={false}>
      <div className="flex h-full flex-col gap-4 rounded-2xl border border-border-strong bg-card p-4 shadow-sm transition-[box-shadow,transform,border-color] duration-base ease-out-quint hover:-translate-y-0.5 hover:shadow-md hover:border-coral-200">
        {/* Recipe Image */}
        <div className="aspect-square w-full rounded-xl bg-muted overflow-hidden relative shrink-0">
          {showImage ? (
            <Image
              src={safeImageUrl}
              alt={recipeTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              quality={90}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <RecipeImageFallback title={recipeTitle} />
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className="absolute top-2 right-2 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-md hover:bg-card transition-colors duration-fast disabled:opacity-50"
            aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-fast ${
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
          <p className="text-sm text-muted-foreground font-mono tabular-nums">
            {Math.round(calories)} cal
          </p>

          {/* Macros */}
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
            <span className="flex items-center gap-1.5 font-semibold text-protein">
              <span className="size-1.5 rounded-full bg-protein" aria-hidden="true" />
              {Math.round(protein)}g
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-carb">
              <span className="size-1.5 rounded-full bg-carb" aria-hidden="true" />
              {Math.round(carbs)}g
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-fat">
              <span className="size-1.5 rounded-full bg-fat" aria-hidden="true" />
              {Math.round(fat)}g
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
