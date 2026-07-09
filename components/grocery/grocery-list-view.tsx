'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Trash2, Share2, ArrowLeft, Beef, Carrot, Milk, Wheat, Package, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
  protein: 'Protein',
  produce: 'Produce',
  dairy: 'Dairy',
  grains: 'Grains',
  pantry: 'Pantry',
  other: 'Other',
}
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  protein: Beef,
  produce: Carrot,
  dairy: Milk,
  grains: Wheat,
  pantry: Package,
  other: ShoppingBag,
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border-strong p-4 md:p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors duration-150"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold flex-1 truncate">{list.name}</h1>
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
              aria-label="Share list"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
              <span>
                {checkedItems} of {totalItems} items
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-300 ease-out-quint"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Custom Item */}
        <div className="bg-card rounded-2xl shadow-sm border border-border-strong p-4 md:p-6 mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Add Custom Item</h2>
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
          const CategoryIcon = CATEGORY_ICONS[category]

          return (
            <div key={category} className="bg-card rounded-2xl shadow-sm border border-border-strong p-4 md:p-6 mb-4">
              <h2 className="flex items-center gap-2 font-bold text-lg mb-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-muted text-foreground">
                  <CategoryIcon className="size-4" />
                </span>
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h2>

              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl transition-colors duration-150',
                      item.checked ? 'bg-primary/5' : 'hover:bg-accent'
                    )}
                  >
                    <button
                      onClick={() => handleToggle(item.id)}
                      disabled={isPending}
                      className="flex flex-1 items-center gap-3 min-w-0 py-3 px-2 md:px-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                      aria-pressed={item.checked}
                      aria-label={item.checked ? `Uncheck ${item.ingredient}` : `Check ${item.ingredient}`}
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 size-7 rounded-lg border-2 flex items-center justify-center transition-colors duration-150',
                          item.checked
                            ? 'bg-primary border-primary text-white'
                            : 'border-border-strong'
                        )}
                      >
                        {item.checked && <Check className="h-4 w-4" />}
                      </span>

                      <span className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'block text-sm md:text-base',
                            item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                          )}
                        >
                          {item.ingredient}
                        </span>
                        {(item.amount || item.unit) && (
                          <span className="block text-xs text-muted-foreground tabular-nums">
                            {item.amount} {item.unit}
                          </span>
                        )}
                      </span>
                    </button>

                    {item.is_custom && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="flex-shrink-0 p-3 mr-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-150 disabled:opacity-50"
                        aria-label={`Delete ${item.ingredient}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
          <div className="bg-card rounded-2xl shadow-sm border border-border-strong p-8 text-center">
            <p className="text-muted-foreground">No items in this grocery list yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Add custom items above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
