/**
 * Plain text export utilities for grocery lists
 */

interface GroceryListItem {
  id: string
  category: string
  ingredient: string
  amount: string
  unit: string
  checked: boolean
  is_custom: boolean
  order_index: number
}

interface GroceryList {
  id: string
  name: string
  grocery_list_items: GroceryListItem[]
}

const CATEGORY_ORDER = ['protein', 'produce', 'dairy', 'grains', 'pantry', 'other']

const CATEGORY_EMOJIS: Record<string, string> = {
  protein: '🥩',
  produce: '🥬',
  dairy: '🥛',
  grains: '🌾',
  pantry: '🏪',
  other: '📦',
}

/**
 * Convert grocery list to plain text format suitable for sharing
 *
 * Format:
 * - List name as header
 * - Legend for checked/unchecked items
 * - Items grouped by category with emoji indicators
 * - Checkmark symbols for completed items
 * - Amount and unit when available
 */
export function generatePlainText(list: GroceryList): string {
  const { name, grocery_list_items } = list

  // Group items by category
  const categorized = grocery_list_items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, GroceryListItem[]>
  )

  // Sort items within each category by order_index
  Object.keys(categorized).forEach((category) => {
    categorized[category].sort((a, b) => a.order_index - b.order_index)
  })

  // Build text output
  let text = `${name}\n`
  text += `✓ = checked, ○ = unchecked\n\n`

  CATEGORY_ORDER.forEach((category) => {
    const items = categorized[category] || []
    if (items.length === 0) return

    const emoji = CATEGORY_EMOJIS[category] || '📦'
    text += `${emoji} ${category.toUpperCase()}\n`

    items.forEach((item) => {
      const check = item.checked ? '✓' : '○'
      const amount =
        item.amount && item.unit
          ? ` - ${item.amount} ${item.unit}`
          : item.amount
            ? ` - ${item.amount}`
            : ''
      text += `${check} ${item.ingredient}${amount}\n`
    })

    text += `\n`
  })

  return text.trim()
}

/**
 * Generate plain text with only unchecked items (useful for active shopping)
 */
export function generatePlainTextUncheckedOnly(list: GroceryList): string {
  const uncheckedList = {
    ...list,
    grocery_list_items: list.grocery_list_items.filter((item) => !item.checked),
  }

  return generatePlainText(uncheckedList)
}
