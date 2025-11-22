import { RecipeIngredient, RecipeInstruction, RecipeWithDetails } from '@/lib/types/recipe'

// Hardcoded fallback data for specific recipes
const FALLBACK_DATA: Record<string, Partial<RecipeWithDetails>> = {
  'Protein Yogurt Bowl': {
    ingredients: [
      { id: '1', recipe_id: 'fallback', ingredient: 'Greek Yogurt', amount: '1', unit: 'cup', order_index: 1, created_at: new Date().toISOString() },
      { id: '2', recipe_id: 'fallback', ingredient: 'Mixed Berries', amount: '1/2', unit: 'cup', order_index: 2, created_at: new Date().toISOString() },
      { id: '3', recipe_id: 'fallback', ingredient: 'Honey', amount: '1', unit: 'tbsp', order_index: 3, created_at: new Date().toISOString() },
      { id: '4', recipe_id: 'fallback', ingredient: 'Granola', amount: '1/4', unit: 'cup', order_index: 4, created_at: new Date().toISOString() },
    ],
    instructions: [
      { id: '1', recipe_id: 'fallback', step_number: 1, instruction: 'Add Greek yogurt to a bowl.', created_at: new Date().toISOString() },
      { id: '2', recipe_id: 'fallback', step_number: 2, instruction: 'Top with mixed berries and granola.', created_at: new Date().toISOString() },
      { id: '3', recipe_id: 'fallback', step_number: 3, instruction: 'Drizzle with honey and serve.', created_at: new Date().toISOString() },
    ]
  }
}

export async function getRecipeFallback(recipeName: string): Promise<Partial<RecipeWithDetails> | null> {
  // 1. Check hardcoded fallbacks first
  if (FALLBACK_DATA[recipeName]) {
    console.log(`Using hardcoded fallback for: ${recipeName}`)
    return FALLBACK_DATA[recipeName]
  }

  // 2. Try TheMealDB API
  try {
    let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipeName)}`)
    let data = await response.json()

    // If no results, try searching with just the first two words of the recipe name
    if (!data.meals) {
      const simplifiedName = recipeName.split(' ').slice(0, 2).join(' ')
      if (simplifiedName !== recipeName && simplifiedName.length > 3) {
        response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(simplifiedName)}`)
        data = await response.json()
      }
    }

    if (data.meals && data.meals.length > 0) {
      const meal = data.meals[0]
      
      // Parse ingredients
      const ingredients: RecipeIngredient[] = []
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]
        const measure = meal[`strMeasure${i}`]
        
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            id: i.toString(),
            recipe_id: 'themealdb',
            ingredient: ingredient.trim(),
            amount: measure?.trim() || '',
            unit: '', // TheMealDB combines amount and unit in strMeasure
            order_index: i,
            created_at: new Date().toISOString()
          })
        }
      }

      // Parse instructions
      const instructions: RecipeInstruction[] = meal.strInstructions
        .split(/\r\n|\n|\r/)
        .filter((line: string) => line.trim().length > 0)
        .map((line: string, index: number) => ({
          id: (index + 1).toString(),
          recipe_id: 'themealdb',
          step_number: index + 1,
          instruction: line.trim(),
          created_at: new Date().toISOString()
        }))

      return { ingredients, instructions }
    }
  } catch (error) {
    console.error('Error fetching from TheMealDB:', error)
  }

  return null
}
