'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/recipes/actions'
import { useOptimistic, useTransition } from 'react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'

interface RecipeHeroProps {
  recipeId: string
  imageUrl: string | null
  recipeName: string
  isFavorite: boolean
}

export function RecipeHero({
  recipeId,
  imageUrl,
  recipeName,
  isFavorite,
}: RecipeHeroProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)

  const handleFavoriteClick = async () => {
    startTransition(() => {
      setOptimisticFavorite(!optimisticFavorite)
    })

    await toggleFavorite(recipeId)
  }

  // Validate image URL for security
  const safeImageUrl = getSafeImageUrl(imageUrl)

  return (
    <div className="relative">
      {/* Header Image */}
      <div className="relative w-full h-[300px]">
        {safeImageUrl ? (
          <Image
            src={safeImageUrl}
            alt={recipeName}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => {
              // Fallback on image load error
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {/* Gradient overlay for better text visibility if needed, though design shows clean image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-50" />
      </div>

      {/* Floating buttons */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className="flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-50"
            aria-label={
              optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <Heart
              className="h-6 w-6"
              fill={optimisticFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
