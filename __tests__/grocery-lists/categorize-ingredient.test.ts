import { describe, it, expect } from 'vitest'

// Helper function extracted for testing
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase()

  // Pantry (check first to avoid conflicts with "pepper")
  if (
    lower.includes('oil') ||
    (lower.includes('salt') && !lower.includes('unsalted')) ||
    lower.includes('spice') ||
    lower.includes('sauce') ||
    lower.includes('dressing') ||
    lower.includes('vinegar') ||
    lower.includes('syrup') ||
    lower.includes('seasoning') ||
    (lower.includes('pepper') && (lower.includes('black') || lower.includes('white') || lower.includes('red pepper flake')))
  ) {
    return 'pantry'
  }

  // Protein
  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('turkey') ||
    lower.includes('steak') ||
    lower.includes('shrimp') ||
    lower.includes('tuna') ||
    lower.includes('eggs')
  ) {
    return 'protein'
  }

  // Produce (check after pantry to handle "pepper" correctly)
  if (
    lower.includes('lettuce') ||
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('pepper') || // bell peppers
    lower.includes('carrot') ||
    lower.includes('broccoli') ||
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('cucumber') ||
    lower.includes('mushroom') ||
    lower.includes('berry') ||
    lower.includes('berries') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('avocado') ||
    lower.includes('asparagus')
  ) {
    return 'produce'
  }

  // Dairy
  if (
    lower.includes('cheese') ||
    lower.includes('milk') ||
    lower.includes('yogurt') ||
    lower.includes('butter') ||
    lower.includes('cream') ||
    lower.includes('parmesan')
  ) {
    return 'dairy'
  }

  // Grains
  if (
    lower.includes('rice') ||
    lower.includes('pasta') ||
    lower.includes('bread') ||
    lower.includes('quinoa') ||
    lower.includes('oats') ||
    lower.includes('flour') ||
    lower.includes('crouton')
  ) {
    return 'grains'
  }

  return 'other'
}

describe('Ingredient Categorization', () => {
  describe('Protein category', () => {
    it('categorizes chicken correctly', () => {
      expect(categorizeIngredient('Chicken breast')).toBe('protein')
      expect(categorizeIngredient('grilled chicken')).toBe('protein')
      expect(categorizeIngredient('CHICKEN THIGHS')).toBe('protein')
    })

    it('categorizes beef correctly', () => {
      expect(categorizeIngredient('Ground beef')).toBe('protein')
      expect(categorizeIngredient('beef steak')).toBe('protein')
    })

    it('categorizes fish correctly', () => {
      expect(categorizeIngredient('Salmon fillet')).toBe('protein')
      expect(categorizeIngredient('Tuna')).toBe('protein')
      expect(categorizeIngredient('Fresh fish')).toBe('protein')
    })

    it('categorizes eggs correctly', () => {
      expect(categorizeIngredient('Eggs')).toBe('protein')
      expect(categorizeIngredient('Large eggs')).toBe('protein')
    })

    it('categorizes other proteins correctly', () => {
      expect(categorizeIngredient('Turkey breast')).toBe('protein')
      expect(categorizeIngredient('Pork chops')).toBe('protein')
      expect(categorizeIngredient('Shrimp')).toBe('protein')
    })
  })

  describe('Produce category', () => {
    it('categorizes vegetables correctly', () => {
      expect(categorizeIngredient('Romaine lettuce')).toBe('produce')
      expect(categorizeIngredient('Cherry tomatoes')).toBe('produce')
      expect(categorizeIngredient('Red onion')).toBe('produce')
      expect(categorizeIngredient('Bell pepper')).toBe('produce')
      expect(categorizeIngredient('Baby carrots')).toBe('produce')
      expect(categorizeIngredient('Broccoli florets')).toBe('produce')
      expect(categorizeIngredient('Fresh spinach')).toBe('produce')
      expect(categorizeIngredient('Asparagus spears')).toBe('produce')
    })

    it('categorizes fruits correctly', () => {
      expect(categorizeIngredient('Mixed berries')).toBe('produce')
      expect(categorizeIngredient('Green apple')).toBe('produce')
      expect(categorizeIngredient('Banana')).toBe('produce')
      expect(categorizeIngredient('Avocado')).toBe('produce')
    })
  })

  describe('Dairy category', () => {
    it('categorizes dairy products correctly', () => {
      expect(categorizeIngredient('Shredded Parmesan cheese')).toBe('dairy')
      expect(categorizeIngredient('Whole milk')).toBe('dairy')
      expect(categorizeIngredient('Greek yogurt')).toBe('dairy')
      expect(categorizeIngredient('Unsalted butter')).toBe('dairy')
      expect(categorizeIngredient('Heavy cream')).toBe('dairy')
    })
  })

  describe('Grains category', () => {
    it('categorizes grains correctly', () => {
      expect(categorizeIngredient('White rice')).toBe('grains')
      expect(categorizeIngredient('Whole wheat pasta')).toBe('grains')
      expect(categorizeIngredient('Sourdough bread')).toBe('grains')
      expect(categorizeIngredient('Quinoa')).toBe('grains')
      expect(categorizeIngredient('Rolled oats')).toBe('grains')
      expect(categorizeIngredient('All-purpose flour')).toBe('grains')
      expect(categorizeIngredient('Croutons')).toBe('grains')
    })
  })

  describe('Pantry category', () => {
    it('categorizes pantry items correctly', () => {
      expect(categorizeIngredient('Olive oil')).toBe('pantry')
      expect(categorizeIngredient('Sea salt')).toBe('pantry')
      expect(categorizeIngredient('Black pepper')).toBe('pantry')
      expect(categorizeIngredient('Italian seasoning')).toBe('pantry')
      expect(categorizeIngredient('Caesar dressing')).toBe('pantry')
      expect(categorizeIngredient('Soy sauce')).toBe('pantry')
      expect(categorizeIngredient('Balsamic vinegar')).toBe('pantry')
      expect(categorizeIngredient('Maple syrup')).toBe('pantry')
    })
  })

  describe('Other category (fallback)', () => {
    it('categorizes unknown ingredients as other', () => {
      expect(categorizeIngredient('Mystery ingredient')).toBe('other')
      expect(categorizeIngredient('Random item')).toBe('other')
      expect(categorizeIngredient('')).toBe('other')
    })
  })

  describe('Case insensitivity', () => {
    it('handles various capitalizations', () => {
      expect(categorizeIngredient('CHICKEN BREAST')).toBe('protein')
      expect(categorizeIngredient('chicken breast')).toBe('protein')
      expect(categorizeIngredient('Chicken Breast')).toBe('protein')
      expect(categorizeIngredient('ChIcKeN bReAsT')).toBe('protein')
    })
  })
})
