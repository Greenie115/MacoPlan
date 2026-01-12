'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSafeImageUrl } from '@/lib/utils/image-validation'

interface RecipeHeroProps {
  recipeId: string
  imageUrl: string | null
  recipeName: string
  isFavorite?: boolean // Deprecated: local recipes no longer support favoriting
}

export function RecipeHero({
  imageUrl,
  recipeName,
}: RecipeHeroProps) {
  const router = useRouter()

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
            quality={90}
            onError={(e) => {
              // Fallback on image load error
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-50" />
      </div>

      {/* Floating back button */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
