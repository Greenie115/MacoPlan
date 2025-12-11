'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Trash2, Share2, ArrowLeft } from 'lucide-react'
import {
  toggleGroceryItem,
  addCustomGroceryItem,
  deleteGroceryItem,
} from '@/app/actions/grocery-lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { generatePlainText } from '@/lib/export/plain-text'
import { useShare } from '@/hooks/use-share'

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

interface GroceryListViewProps {
  list: {
    id: string
    name: string
    plan_id: string | null
    created_at: string
    grocery_list_items: GroceryListItem[]
  }
}

const CATEGORY_ORDER = ['protein', 'produce', 'dairy', 'grains', 'pantry', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  protein: '🥩 Protein',
  produce: '🥬 Produce',
  dairy: '🥛 Dairy',
  grains: '🌾 Grains',
  pantry: '🏪 Pantry',
  other: '📦 Other',
}

export function GroceryListView({ list }: GroceryListViewProps) {
  const router = useRouter()
  const { share, isSharing } = useShare()
  const [items, setItems] = useState(list.grocery_list_items)
  const [newItem, setNewItem] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('other')
  const [isPending, startTransition] = useTransition()

  // Group items by category
  const categorizedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, GroceryListItem[]>
  )

  // Sort items within each category by order_index
  Object.keys(categorizedItems).forEach((category) => {
    categorizedItems[category].sort((a, b) => a.order_index - b.order_index)
  })

  const totalItems = items.length
  const checkedItems = items.filter((i) => i.checked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  const handleToggle = async (itemId: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    )

    startTransition(async () => {
      const result = await toggleGroceryItem(itemId)
      if (result.error) {
        toast.error(result.error)
        // Revert on error
        setItems(list.grocery_list_items)
      } else {
        router.refresh()
      }
    })
  }

  const handleAddItem = async () => {
    if (!newItem.trim()) {
      toast.error('Please enter an ingredient name')
      return
    }

    startTransition(async () => {
      const result = await addCustomGroceryItem(
        list.id,
        newItem,
        newItemAmount,
        newItemUnit,
        newItemCategory
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Item added')
        setNewItem('')
        setNewItemAmount('')
        setNewItemUnit('')
        setNewItemCategory('other')
        router.refresh()
      }
    })
  }

  const handleDelete = async (itemId: string) => {
    // Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== itemId))

    startTransition(async () => {
      const result = await deleteGroceryItem(itemId, list.id)
      if (result.error) {
        toast.error(result.error)
        // Revert on error
        setItems(list.grocery_list_items)
      } else {
        toast.success('Item deleted')
        router.refresh()
      }
    })
  }

  const handleBack = () => {
    if (list.plan_id) {
      router.push(`/meal-plans/${list.plan_id}`)
    } else {
      router.push('/meal-plans')
    }
  }

  const handleShare = () => {
    const text = generatePlainText(list)
    share({
      title: list.name,
      text: text,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold flex-1">{list.name}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="hidden md:flex"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              disabled={isSharing}
              className="md:hidden"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {checkedItems} of {totalItems} items
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Custom Item */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Custom Item</h2>
          <div className="space-y-3">
            <div>
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ingredient name..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                placeholder="Amount"
                disabled={isPending}
              />
              <Input
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="Unit"
                disabled={isPending}
              />
              <Select
                value={newItemCategory}
                onValueChange={setNewItemCategory}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="pantry">Pantry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full"
              disabled={isPending || !newItem.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Categorized Items */}
        {CATEGORY_ORDER.map((category) => {
          const categoryItems = categorizedItems[category] || []
          if (categoryItems.length === 0) return null

          return (
            <div key={category} className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
              <h2 className="font-bold text-lg mb-3">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h2>

              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg group transition-colors"
                  >
                    <button
                      onClick={() => handleToggle(item.id)}
                      disabled={isPending}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={item.checked ? 'Uncheck item' : 'Check item'}
                    >
                      {item.checked && <Check className="h-4 w-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm md:text-base ${
                          item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {item.ingredient}
                      </p>
                      {(item.amount || item.unit) && (
                        <p className="text-xs text-gray-500">
                          {item.amount} {item.unit}
                        </p>
                      )}
                    </div>

                    {item.is_custom && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No items in this grocery list yet.</p>
            <p className="text-sm text-gray-400 mt-2">Add custom items above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
