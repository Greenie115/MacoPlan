/**
 * Shopping List Generator
 *
 * Extracts and aggregates ingredients from meal plan recipes
 * Handles unit conversions and categorization
 */

import convert from 'convert-units'
import type {
  CategorizedIngredients,
  ShoppingListIngredient,
} from '@/lib/types/database'
import type { SpoonacularIngredient } from '@/lib/types/spoonacular'

// ============================================================================
// Ingredient Categorization
// ============================================================================

const INGREDIENT_CATEGORIES = {
  produce: [
    'produce',
    'vegetables',
    'fruits',
    'fresh vegetables',
    'fresh fruits',
    'lettuce',
    'tomato',
    'onion',
    'garlic',
    'potato',
    'carrot',
    'celery',
    'pepper',
    'cucumber',
    'zucchini',
    'broccoli',
    'cauliflower',
    'spinach',
    'kale',
    'apple',
    'banana',
    'orange',
    'lemon',
    'lime',
    'berries',
    'herbs',
    'cilantro',
    'parsley',
    'basil',
    'mint',
    'thyme',
    'rosemary',
  ],
  dairy: [
    'dairy',
    'milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'sour cream',
    'cottage cheese',
    'cheddar',
    'mozzarella',
    'parmesan',
    'feta',
    'ricotta',
    'cream cheese',
    'half and half',
    'whipping cream',
  ],
  meat: [
    'meat',
    'chicken',
    'beef',
    'pork',
    'turkey',
    'lamb',
    'steak',
    'ground beef',
    'ground turkey',
    'chicken breast',
    'chicken thigh',
    'bacon',
    'sausage',
    'ham',
    'fish',
    'salmon',
    'tuna',
    'cod',
    'shrimp',
    'seafood',
    'shellfish',
  ],
  pantry: [
    'condiments',
    'spices',
    'baking',
    'canned',
    'flour',
    'sugar',
    'salt',
    'pepper',
    'oil',
    'olive oil',
    'vegetable oil',
    'vinegar',
    'soy sauce',
    'ketchup',
    'mustard',
    'mayonnaise',
    'pasta',
    'rice',
    'beans',
    'lentils',
    'nuts',
    'seeds',
    'honey',
    'maple syrup',
    'vanilla',
    'cinnamon',
    'paprika',
    'cumin',
    'oregano',
    'stock',
    'broth',
  ],
  bakery: [
    'bread',
    'bakery',
    'rolls',
    'buns',
    'bagels',
    'tortillas',
    'pita',
    'naan',
    'croissant',
    'pastry',
  ],
  frozen: ['frozen', 'ice cream', 'frozen vegetables', 'frozen fruits'],
}

// ============================================================================
// Categorize Ingredient
// ============================================================================

export function categorizeIngredient(ingredient: SpoonacularIngredient): string {
  const name = ingredient.name.toLowerCase()
  const aisle = ingredient.aisle?.toLowerCase() || ''
  const searchText = `${name} ${aisle}`

  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      return category
    }
  }

  return 'other'
}

// ============================================================================
// Aggregate Ingredients
// ============================================================================

interface IngredientMap {
  [key: string]: {
    name: string
    amount: number
    unit: string
    originals: string[]
    aisle?: string
  }
}

export function aggregateIngredients(
  ingredients: SpoonacularIngredient[]
): IngredientMap {
  const map: IngredientMap = {}

  ingredients.forEach((ingredient) => {
    const key = ingredient.nameClean || ingredient.name.toLowerCase()

    if (!map[key]) {
      map[key] = {
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        originals: [ingredient.original],
        aisle: ingredient.aisle,
      }
    } else {
      // Try to convert and add amounts if units are compatible
      try {
        if (canConvertUnits(map[key].unit, ingredient.unit)) {
          const convertedAmount = convertUnit(
            ingredient.amount,
            ingredient.unit,
            map[key].unit
          )
          map[key].amount += convertedAmount
        } else {
          // If units are incompatible, just add to originals
          map[key].originals.push(ingredient.original)
        }
      } catch (error) {
        // If conversion fails, add to originals
        map[key].originals.push(ingredient.original)
      }
    }
  })

  return map
}

// ============================================================================
// Unit Conversion Helpers
// ============================================================================

function canConvertUnits(unit1: string, unit2: string): boolean {
  if (!unit1 || !unit2) return false
  if (unit1 === unit2) return true

  try {
    // Normalize unit names
    const normalized1 = normalizeUnit(unit1)
    const normalized2 = normalizeUnit(unit2)

    if (!normalized1 || !normalized2) return false

    // Try to convert between units
    convert(1).from(normalized1 as any).to(normalized2 as any)
    return true
  } catch {
    return false
  }
}

function convertUnit(amount: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return amount

  const normalized1 = normalizeUnit(fromUnit)
  const normalized2 = normalizeUnit(toUnit)

  if (!normalized1 || !normalized2) return amount

  try {
    return convert(amount).from(normalized1 as any).to(normalized2 as any)
  } catch {
    return amount
  }
}

function normalizeUnit(unit: string): string | null {
  const unitMap: Record<string, string> = {
    // Volume
    cup: 'cup',
    cups: 'cup',
    c: 'cup',
    tablespoon: 'Tbs',
    tablespoons: 'Tbs',
    tbsp: 'Tbs',
    tbs: 'Tbs',
    teaspoon: 'tsp',
    teaspoons: 'tsp',
    tsp: 'tsp',
    milliliter: 'ml',
    milliliters: 'ml',
    ml: 'ml',
    liter: 'l',
    liters: 'l',
    l: 'l',
    'fluid ounce': 'fl-oz',
    'fluid ounces': 'fl-oz',
    'fl oz': 'fl-oz',
    'fl-oz': 'fl-oz',
    pint: 'pnt',
    pints: 'pnt',
    quart: 'qt',
    quarts: 'qt',
    gallon: 'gal',
    gallons: 'gal',

    // Mass
    gram: 'g',
    grams: 'g',
    g: 'g',
    kilogram: 'kg',
    kilograms: 'kg',
    kg: 'kg',
    ounce: 'oz',
    ounces: 'oz',
    oz: 'oz',
    pound: 'lb',
    pounds: 'lb',
    lb: 'lb',
    lbs: 'lb',
  }

  const normalized = unit.toLowerCase().trim()
  return unitMap[normalized] || null
}

// ============================================================================
// Generate Categorized Shopping List
// ============================================================================

export function generateShoppingList(
  ingredientsList: SpoonacularIngredient[]
): CategorizedIngredients {
  // Step 1: Aggregate duplicate ingredients
  const aggregated = aggregateIngredients(ingredientsList)

  // Step 2: Categorize and format
  const categorized: CategorizedIngredients = {
    produce: [],
    dairy: [],
    meat: [],
    pantry: [],
    bakery: [],
    frozen: [],
    other: [],
  }

  Object.entries(aggregated).forEach(([key, data]) => {
    // Create ingredient object
    const ingredient: ShoppingListIngredient = {
      id: key,
      name: data.name,
      amount: Math.round(data.amount * 100) / 100, // Round to 2 decimals
      unit: data.unit,
      original: data.originals[0], // Use first original string
      aisle: data.aisle,
    }

    // Determine category
    const fakeSpoonacularIngredient: SpoonacularIngredient = {
      id: 0,
      name: data.name,
      original: data.originals[0],
      amount: data.amount,
      unit: data.unit,
      aisle: data.aisle,
    }

    const category = categorizeIngredient(fakeSpoonacularIngredient)

    // Add to appropriate category
    if (category in categorized) {
      categorized[category as keyof CategorizedIngredients].push(ingredient)
    } else {
      categorized.other.push(ingredient)
    }
  })

  // Step 3: Sort ingredients alphabetically within each category
  Object.keys(categorized).forEach((category) => {
    categorized[category as keyof CategorizedIngredients].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  })

  return categorized
}

// ============================================================================
// Export as CSV
// ============================================================================

export function generateShoppingListCSV(
  ingredients: CategorizedIngredients,
  checkedItems: string[]
): string {
  const lines: string[] = [
    'Category,Ingredient,Quantity,Unit,Checked',
  ]

  Object.entries(ingredients).forEach(([category, items]) => {
    items.forEach((item: ShoppingListIngredient) => {
      const isChecked = checkedItems.includes(item.id)
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
      const quantity = item.amount || ''
      const unit = item.unit || ''
      lines.push(
        `"${categoryName}","${item.name}","${quantity}","${unit}","${isChecked}"`
      )
    })
  })

  return lines.join('\n')
}

// ============================================================================
// Format for Display
// ============================================================================

export function formatIngredientDisplay(ingredient: ShoppingListIngredient): string {
  const amount = ingredient.amount ? `${ingredient.amount}` : ''
  const unit = ingredient.unit || ''
  const name = ingredient.name

  if (amount && unit) {
    return `${amount} ${unit} ${name}`
  } else if (amount) {
    return `${amount} ${name}`
  } else {
    return name
  }
}
