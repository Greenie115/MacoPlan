'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight } from 'lucide-react'
import { LogRecipeModal } from '@/components/recipes/log-recipe-modal'
import Link from 'next/link'

interface FavoriteRecipe {
  id: string
  name: string
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  image_url: string | null
}

interface QuickLogWidgetProps {
  favoriteRecipes: FavoriteRecipe[]
}

export function QuickLogWidget({ favoriteRecipes }: QuickLogWidgetProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<FavoriteRecipe | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRecipeClick = (recipe: FavoriteRecipe) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecipe(null)
  }

  if (favoriteRecipes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-charcoal">Quick Log</h3>
          <Link
            href="/recipes?tab=favorites"
            className="text-sm text-primary font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3">❤️</div>
          <p className="text-sm text-muted-foreground mb-4">
            No favorite recipes yet
          </p>
          <Link href="/recipes">
            <Button variant="outline" size="sm">
              Browse Recipes
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-charcoal">Quick Log</h3>
          <Link
            href="/recipes?tab=favorites"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Log your favorite recipes with one tap
        </p>

        <div className="space-y-2">
          {favoriteRecipes.slice(0, 5).map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">
                    {recipe.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recipe.calories} cal • {recipe.protein_grams}g P
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary shrink-0" />
            </button>
          ))}
        </div>

        {favoriteRecipes.length > 5 && (
          <Link href="/recipes?tab=favorites">
            <Button variant="ghost" className="w-full mt-3 text-sm">
              View {favoriteRecipes.length - 5} more
            </Button>
          </Link>
        )}
      </Card>

      {selectedRecipe && (
        <LogRecipeModal
          open={isModalOpen}
          onClose={handleCloseModal}
          recipe={selectedRecipe}
          onSuccess={handleCloseModal}
        />
      )}
    </>
  )
}
