/**
 * Recipe Keyword Extraction Utility
 *
 * Extracts meaningful keywords from recipe titles for intelligent
 * swap meal searching. Identifies proteins, cuisines, cooking methods,
 * and key ingredients.
 */

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'with', 'in', 'on', 'for', 'of', 'to',
  'my', 'your', 'our', 'easy', 'quick', 'simple', 'best', 'perfect',
  'delicious', 'homemade', 'classic', 'style', 'inspired', 'minute',
  'minutes', 'recipe', 'dish', 'meal', 'food', 'healthy', 'low', 'high',
  'free', 'friendly', 'make', 'makes', 'day', 'night', 'special',
])

// Protein sources - high priority for matching
const PROTEIN_KEYWORDS = new Set([
  // Poultry
  'chicken', 'turkey', 'duck', 'poultry',
  // Red meat
  'beef', 'steak', 'pork', 'lamb', 'veal', 'brisket', 'ribs',
  // Seafood
  'salmon', 'tuna', 'shrimp', 'fish', 'cod', 'tilapia', 'halibut',
  'crab', 'lobster', 'scallops', 'mussels', 'clams', 'seafood', 'prawn',
  // Plant proteins
  'tofu', 'tempeh', 'seitan', 'lentils', 'lentil', 'chickpea', 'chickpeas',
  'beans', 'bean', 'edamame', 'quinoa',
  // Eggs/Dairy
  'egg', 'eggs', 'cheese', 'paneer',
])

// Cuisine types - useful for finding similar style dishes
const CUISINE_KEYWORDS = new Set([
  'italian', 'mexican', 'chinese', 'japanese', 'thai', 'indian', 'korean',
  'vietnamese', 'mediterranean', 'greek', 'french', 'spanish', 'american',
  'cajun', 'creole', 'tex-mex', 'asian', 'middle eastern', 'moroccan',
  'caribbean', 'hawaiian', 'southern', 'bbq', 'barbecue',
])

// Cooking methods - secondary priority
const COOKING_METHOD_KEYWORDS = new Set([
  'grilled', 'baked', 'roasted', 'fried', 'sauteed', 'steamed', 'braised',
  'smoked', 'pan-fried', 'stir-fry', 'stir-fried', 'broiled', 'poached',
  'slow-cooked', 'instant pot', 'air fryer', 'crispy', 'crunchy',
])

// Key carb/base ingredients
const BASE_INGREDIENTS = new Set([
  'rice', 'pasta', 'noodles', 'bread', 'potato', 'potatoes', 'quinoa',
  'couscous', 'farro', 'barley', 'orzo', 'risotto', 'tortilla', 'wrap',
  'bowl', 'salad', 'soup', 'stew', 'curry', 'stir-fry', 'casserole',
  'sandwich', 'burger', 'tacos', 'burrito', 'pizza', 'flatbread',
])

// Dietary preference exclusions
const MEAT_PROTEINS = new Set([
  'chicken', 'turkey', 'duck', 'beef', 'steak', 'pork', 'lamb', 'veal',
  'brisket', 'ribs', 'bacon', 'sausage', 'ham', 'prosciutto',
])

const SEAFOOD_PROTEINS = new Set([
  'salmon', 'tuna', 'shrimp', 'fish', 'cod', 'tilapia', 'halibut',
  'crab', 'lobster', 'scallops', 'mussels', 'clams', 'seafood', 'prawn',
  'anchovy', 'sardine',
])

const ANIMAL_PRODUCTS = new Set([
  ...MEAT_PROTEINS,
  ...SEAFOOD_PROTEINS,
  'egg', 'eggs', 'cheese', 'cream', 'butter', 'milk', 'yogurt', 'paneer',
])

export interface ExtractedKeywords {
  /** Primary protein source (chicken, beef, tofu, etc.) */
  protein: string | null
  /** Cuisine type if identifiable */
  cuisine: string | null
  /** Cooking method (grilled, baked, etc.) */
  cookingMethod: string | null
  /** Base/carb component (rice, pasta, etc.) */
  base: string | null
  /** All significant keywords for search */
  allKeywords: string[]
  /** Best search expression to use */
  searchExpression: string
}

/**
 * Extract meaningful keywords from a recipe title
 */
export function extractRecipeKeywords(recipeTitle: string): ExtractedKeywords {
  // Normalize: lowercase, remove special chars, split into words
  const normalized = recipeTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/-/g, ' ')

  const words = normalized.split(/\s+/).filter(word => word.length > 1)

  // Filter out stop words
  const meaningfulWords = words.filter(word => !STOP_WORDS.has(word))

  // Identify categories
  let protein: string | null = null
  let cuisine: string | null = null
  let cookingMethod: string | null = null
  let base: string | null = null
  const otherKeywords: string[] = []

  for (const word of meaningfulWords) {
    if (!protein && PROTEIN_KEYWORDS.has(word)) {
      protein = word
    } else if (!cuisine && CUISINE_KEYWORDS.has(word)) {
      cuisine = word
    } else if (!cookingMethod && COOKING_METHOD_KEYWORDS.has(word)) {
      cookingMethod = word
    } else if (!base && BASE_INGREDIENTS.has(word)) {
      base = word
    } else if (word.length > 2) {
      otherKeywords.push(word)
    }
  }

  // Build all keywords list (prioritized)
  const allKeywords: string[] = []
  if (protein) allKeywords.push(protein)
  if (base) allKeywords.push(base)
  if (cuisine) allKeywords.push(cuisine)
  if (cookingMethod) allKeywords.push(cookingMethod)
  allKeywords.push(...otherKeywords.slice(0, 2)) // Add up to 2 other keywords

  // Build search expression (most important keywords first)
  let searchExpression = ''
  if (protein) {
    searchExpression = protein
    if (base) {
      searchExpression += ` ${base}`
    } else if (cookingMethod) {
      searchExpression += ` ${cookingMethod}`
    }
  } else if (base) {
    searchExpression = base
    if (cuisine) {
      searchExpression += ` ${cuisine}`
    }
  } else if (allKeywords.length > 0) {
    searchExpression = allKeywords.slice(0, 2).join(' ')
  }

  return {
    protein,
    cuisine,
    cookingMethod,
    base,
    allKeywords,
    searchExpression: searchExpression || 'healthy meal',
  }
}

/**
 * Check if a recipe title contains ingredients that conflict with dietary preferences
 */
export function checkDietaryConflict(
  recipeTitle: string,
  dietaryStyle: string | null,
  allergies: string[] | null
): boolean {
  const normalized = recipeTitle.toLowerCase()
  const words = normalized.split(/\s+/)

  // Check dietary style conflicts
  if (dietaryStyle) {
    switch (dietaryStyle) {
      case 'vegetarian':
        // Vegetarians don't eat meat or seafood
        for (const word of words) {
          if (MEAT_PROTEINS.has(word) || SEAFOOD_PROTEINS.has(word)) {
            return true
          }
        }
        break
      case 'vegan':
        // Vegans don't eat any animal products
        for (const word of words) {
          if (ANIMAL_PRODUCTS.has(word)) {
            return true
          }
        }
        break
      case 'pescatarian':
        // Pescatarians don't eat meat (but allow fish)
        for (const word of words) {
          if (MEAT_PROTEINS.has(word)) {
            return true
          }
        }
        break
    }
  }

  // Check allergy conflicts
  if (allergies && allergies.length > 0) {
    for (const allergy of allergies) {
      const allergyLower = allergy.toLowerCase()
      if (normalized.includes(allergyLower)) {
        return true
      }
      // Common allergen mappings
      if (allergyLower === 'dairy' &&
          (normalized.includes('cheese') || normalized.includes('cream') ||
           normalized.includes('butter') || normalized.includes('milk'))) {
        return true
      }
      if (allergyLower === 'gluten' &&
          (normalized.includes('bread') || normalized.includes('pasta') ||
           normalized.includes('noodle') || normalized.includes('flour'))) {
        return true
      }
      if (allergyLower === 'shellfish' &&
          (normalized.includes('shrimp') || normalized.includes('crab') ||
           normalized.includes('lobster') || normalized.includes('scallop'))) {
        return true
      }
    }
  }

  return false
}

/**
 * Build dietary-aware search terms
 */
export function buildDietarySearchTerms(
  dietaryStyle: string | null
): string[] {
  switch (dietaryStyle) {
    case 'vegetarian':
      return ['vegetarian', 'tofu', 'cheese', 'egg', 'lentil', 'bean']
    case 'vegan':
      return ['vegan', 'tofu', 'tempeh', 'lentil', 'chickpea', 'plant-based']
    case 'pescatarian':
      return ['fish', 'salmon', 'shrimp', 'seafood', 'tuna']
    case 'keto':
      return ['keto', 'low-carb', 'protein']
    case 'paleo':
      return ['paleo', 'whole30', 'grain-free']
    case 'mediterranean':
      return ['mediterranean', 'greek', 'olive', 'fish']
    default:
      return []
  }
}

/**
 * Calculate macro similarity score between two meals
 * Returns 0-1 where 1 is perfect match
 */
export function calculateMacroSimilarity(
  original: { calories: number; protein: number; carbs: number; fat: number },
  candidate: { calories: number; protein: number; carbs: number; fat: number }
): number {
  // Avoid division by zero
  if (original.calories === 0 || candidate.calories === 0) {
    return 0
  }

  // Calculate macro ratios (percentage of calories from each macro)
  const origProteinRatio = (original.protein * 4) / original.calories
  const origCarbRatio = (original.carbs * 4) / original.calories
  const origFatRatio = (original.fat * 9) / original.calories

  const candProteinRatio = (candidate.protein * 4) / candidate.calories
  const candCarbRatio = (candidate.carbs * 4) / candidate.calories
  const candFatRatio = (candidate.fat * 9) / candidate.calories

  // Calculate differences (0 = identical, 1 = completely different)
  const proteinDiff = Math.abs(origProteinRatio - candProteinRatio)
  const carbDiff = Math.abs(origCarbRatio - candCarbRatio)
  const fatDiff = Math.abs(origFatRatio - candFatRatio)

  // Weight protein matching more heavily (users care most about protein)
  const weightedDiff = (proteinDiff * 0.5) + (carbDiff * 0.25) + (fatDiff * 0.25)

  // Convert to similarity score (1 = identical, 0 = very different)
  return Math.max(0, 1 - weightedDiff * 2)
}
