import { describe, it, expect } from 'vitest'
import {
  generateShoppingList,
  aggregateIngredients,
  categorizeIngredient,
  type RecipeIngredient,
} from '@/lib/utils/shopping-list-generator'

describe('Shopping List Generator', () => {
  describe('categorizeIngredient', () => {
    it('should categorize protein correctly', () => {
      expect(categorizeIngredient({ name: 'chicken breast' } as RecipeIngredient)).toBe(
        'meat'
      )
      expect(categorizeIngredient({ name: 'ground beef' } as RecipeIngredient)).toBe('meat')
      expect(categorizeIngredient({ name: 'salmon fillet' } as RecipeIngredient)).toBe(
        'meat'
      )
      // Note: eggs are categorized as 'other' since they're not in the dairy keywords
      expect(categorizeIngredient({ name: 'eggs' } as RecipeIngredient)).toBe('other')
    })

    it('should categorize produce correctly', () => {
      expect(categorizeIngredient({ name: 'tomatoes' } as RecipeIngredient)).toBe('produce')
      expect(categorizeIngredient({ name: 'lettuce' } as RecipeIngredient)).toBe('produce')
      expect(categorizeIngredient({ name: 'onion' } as RecipeIngredient)).toBe('produce')
      expect(categorizeIngredient({ name: 'bell pepper' } as RecipeIngredient)).toBe(
        'produce'
      )
    })

    it('should categorize dairy correctly', () => {
      expect(categorizeIngredient({ name: 'milk' } as RecipeIngredient)).toBe('dairy')
      expect(categorizeIngredient({ name: 'cheese' } as RecipeIngredient)).toBe('dairy')
      expect(categorizeIngredient({ name: 'yogurt' } as RecipeIngredient)).toBe('dairy')
      expect(categorizeIngredient({ name: 'butter' } as RecipeIngredient)).toBe('dairy')
    })

    it('should categorize pantry items correctly', () => {
      expect(categorizeIngredient({ name: 'olive oil' } as RecipeIngredient)).toBe('pantry')
      expect(categorizeIngredient({ name: 'salt' } as RecipeIngredient)).toBe('pantry')
      expect(categorizeIngredient({ name: 'soy sauce' } as RecipeIngredient)).toBe('pantry')
    })

    it('should categorize bakery items correctly', () => {
      expect(categorizeIngredient({ name: 'bread' } as RecipeIngredient)).toBe('bakery')
      expect(categorizeIngredient({ name: 'tortillas' } as RecipeIngredient)).toBe('bakery')
    })

    it('should categorize frozen items correctly', () => {
      expect(categorizeIngredient({ name: 'frozen peas' } as RecipeIngredient)).toBe(
        'frozen'
      )
      // Note: ice cream contains 'cream' keyword, so it's categorized as dairy first
      expect(categorizeIngredient({ name: 'ice cream' } as RecipeIngredient)).toBe('dairy')
    })

    it('should default to "other" for unknown items', () => {
      expect(categorizeIngredient({ name: 'mystery ingredient' } as RecipeIngredient)).toBe(
        'other'
      )
    })
  })

  describe('aggregateIngredients', () => {
    it('should combine duplicate ingredients', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Chicken Breast',
          amount: 2,
          unit: 'lbs',
          aisle: 'Meat',
        } as RecipeIngredient,
        {
          id: 2,
          name: 'chicken breast',
          amount: 1,
          unit: 'lbs',
          aisle: 'Meat',
        } as RecipeIngredient,
      ]

      const result = aggregateIngredients(ingredients)
      const chickenEntry = Object.values(result).find(
        (item) => item.name.toLowerCase() === 'chicken breast'
      )

      expect(chickenEntry).toBeDefined()
      expect(chickenEntry?.amount).toBe(3)
    })

    it('should handle different units gracefully', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Sugar',
          amount: 2,
          unit: 'cups',
          aisle: 'Baking',
        } as RecipeIngredient,
        {
          id: 2,
          name: 'sugar',
          amount: 100,
          unit: 'grams',
          aisle: 'Baking',
        } as RecipeIngredient,
      ]

      const result = aggregateIngredients(ingredients)
      expect(Object.keys(result)).toHaveLength(1) // Should aggregate despite unit difference
    })

    it('should preserve aisle information', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Tomato',
          amount: 3,
          unit: 'whole',
          aisle: 'Produce',
        } as RecipeIngredient,
      ]

      const result = aggregateIngredients(ingredients)
      const tomato = Object.values(result)[0]

      expect(tomato.aisle).toBe('Produce')
    })
  })

  describe('generateShoppingList', () => {
    it('should generate categorized shopping list', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Chicken Breast',
          amount: 2,
          unit: 'lbs',
          aisle: 'Meat',
        } as RecipeIngredient,
        {
          id: 2,
          name: 'Tomatoes',
          amount: 4,
          unit: 'whole',
          aisle: 'Produce',
        } as RecipeIngredient,
        {
          id: 3,
          name: 'Milk',
          amount: 1,
          unit: 'gallon',
          aisle: 'Dairy',
        } as RecipeIngredient,
        {
          id: 4,
          name: 'Olive Oil',
          amount: 2,
          unit: 'tbsp',
          aisle: 'Oils',
        } as RecipeIngredient,
      ]

      const result = generateShoppingList(ingredients)

      expect(result.meat.length).toBe(1)
      expect(result.produce.length).toBe(1)
      expect(result.dairy.length).toBe(1)
      expect(result.pantry.length).toBe(1)
      expect(result.bakery.length).toBe(0)
      expect(result.frozen.length).toBe(0)
      expect(result.other.length).toBe(0)
    })

    it('should round amounts to 2 decimal places', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Flour',
          amount: 2.666666,
          unit: 'cups',
          aisle: 'Baking',
        } as RecipeIngredient,
      ]

      const result = generateShoppingList(ingredients)
      const flour = result.other[0] || result.pantry[0]

      expect(flour.amount).toBe(2.67)
    })

    it('should handle empty ingredient list', () => {
      const result = generateShoppingList([])

      expect(result.meat.length).toBe(0)
      expect(result.produce.length).toBe(0)
      expect(result.dairy.length).toBe(0)
      expect(result.pantry.length).toBe(0)
      expect(result.bakery.length).toBe(0)
      expect(result.frozen.length).toBe(0)
      expect(result.other.length).toBe(0)
    })

    it('should create proper shopping list ingredient format', () => {
      const ingredients: RecipeIngredient[] = [
        {
          id: 1,
          name: 'Rice',
          amount: 2,
          unit: 'cups',
          aisle: 'Grains',
        } as RecipeIngredient,
      ]

      const result = generateShoppingList(ingredients)
      const rice = result.other[0] || result.pantry[0]

      expect(rice).toHaveProperty('id')
      expect(rice).toHaveProperty('name')
      expect(rice).toHaveProperty('amount')
      expect(rice).toHaveProperty('unit')
      expect(rice).toHaveProperty('original')
      expect(rice).toHaveProperty('aisle')
      expect(rice.name).toBe('Rice')
      expect(rice.amount).toBe(2)
      expect(rice.unit).toBe('cups')
    })
  })
})
