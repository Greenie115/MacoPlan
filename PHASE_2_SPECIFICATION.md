# MacroPlan Phase 2: Advanced Meal Planning & Premium Features

**Planning Date:** 2025-11-25
**Target Completion:** 2-3 weeks (10-15 working days)
**Status:** 📋 Specification - Ready for Implementation

---

## Executive Summary

Phase 2 focuses on completing the **core meal planning functionality** and implementing **monetization through Stripe**. This phase transforms MacroPlan from a macro calculator with recipe logging into a full-featured meal planning SaaS.

**Key Goals:**
1. ✅ Enable users to generate custom weekly meal plans
2. ✅ Implement automated grocery list generation
3. ✅ Add Stripe subscription management (Premium tier)
4. ✅ Gate premium features appropriately
5. ✅ Improve user engagement with progress tracking

---

## 1. Feature Priority Matrix

### High Priority (Must Have) 🔴
| Feature | User Value | Complexity | Days | Why Priority |
|---------|-----------|------------|------|--------------|
| **Meal Plan Generator** | 🔥🔥🔥 Very High | ⚙️⚙️⚙️ High | 3-4 | Core product value, main use case |
| **Weekly Meal Planning UI** | 🔥🔥🔥 Very High | ⚙️⚙️ Medium | 2-3 | Essential for plan management |
| **Grocery List Generator** | 🔥🔥 High | ⚙️ Low | 1-2 | High value, low effort quick win |
| **Stripe Integration** | 🔥🔥 High | ⚙️⚙️ Medium | 2-3 | Required for monetization |
| **Premium Feature Gating** | 🔥🔥 High | ⚙️ Low | 1 | Required for freemium model |

**Total: 9-13 days for core features**

### Medium Priority (Should Have) 🟡
| Feature | User Value | Complexity | Days | Notes |
|---------|-----------|------------|------|-------|
| **Progress Tracking Dashboard** | 🔥🔥 High | ⚙️⚙️ Medium | 2-3 | Increases engagement |
| **Recipe Ratings/Reviews** | 🔥 Medium | ⚙️⚙️ Medium | 2 | Improves recipe discovery |
| **Advanced Recipe Filters** | 🔥 Medium | ⚙️ Low | 1 | Enhances user experience |
| **Weight Tracking** | 🔥 Medium | ⚙️ Low | 1-2 | Valuable for goal tracking |

**Total: 6-8 days for enhancements**

### Low Priority (Nice to Have) 🟢
| Feature | User Value | Complexity | Days | Defer Until |
|---------|-----------|------------|------|-------------|
| AI Meal Plan Generation | 🔥 Medium | ⚙️⚙️⚙️ High | 4-5 | Phase 3 (needs budget) |
| Social Sharing | 🔥 Low | ⚙️⚙️ Medium | 3 | Phase 3 (after core) |
| Photo Logging | 🔥 Low | ⚙️⚙️⚙️ High | 4 | Phase 3 (storage costs) |
| Recipe Import | 🔥 Low | ⚙️⚙️ Medium | 2-3 | Phase 3 (nice to have) |

---

## 2. Implementation Order (Recommended)

### Sprint 1 (Week 1): Core Planning Features
**Days 1-2:** Grocery List Generator ✅
**Days 3-5:** Weekly Meal Planning UI ✅
**Days 6-7:** Meal Plan Generator (Algorithm-based) ✅

### Sprint 2 (Week 2): Monetization
**Days 8-10:** Stripe Integration ✅
**Day 11:** Premium Feature Gating ✅
**Day 12:** Progress Tracking Dashboard ✅
**Day 13:** Testing & Bug Fixes

### Sprint 3 (Week 3): Polish & Launch
**Days 14-15:** Final polish, documentation, deployment

---

## 3. Detailed Feature Specifications

---

## Feature 1: Grocery List Generator 🛒

### User Story
> "As a user, I want to generate a grocery list from my meal plan so I can shop efficiently for the week."

### Acceptance Criteria
- ✅ User can click "Generate Grocery List" from a meal plan
- ✅ System aggregates all ingredients from plan recipes
- ✅ Ingredients are grouped by category (Protein, Produce, Dairy, etc.)
- ✅ Quantities are summed and converted to common units
- ✅ User can check off items as they shop
- ✅ User can add custom items to the list
- ✅ List persists and can be edited/shared

### Database Schema Changes

```sql
-- Create grocery_lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Grocery List',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grocery_list_items table
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'protein', 'produce', 'dairy', 'grains', 'pantry', 'other'
  ingredient TEXT NOT NULL,
  amount TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE, -- user-added item
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grocery_lists_user ON grocery_lists(user_id);
CREATE INDEX idx_grocery_lists_plan ON grocery_lists(meal_plan_id);
CREATE INDEX idx_grocery_items_list ON grocery_list_items(list_id);
CREATE INDEX idx_grocery_items_category ON grocery_list_items(list_id, category);

-- RLS Policies
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own grocery items"
  ON grocery_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );
```

### Server Actions

**File:** `app/actions/grocery-lists.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface GroceryItem {
  category: string
  ingredient: string
  amount: string
  unit?: string
  recipeId?: string
}

/**
 * Generate grocery list from a meal plan
 */
export async function generateGroceryList(planId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 1. Verify user owns the meal plan
  const { data: plan, error: planError } = await supabase
    .from('meal_plans')
    .select('id, name')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    return { error: 'Meal plan not found' }
  }

  // 2. Get all recipes in the plan with their ingredients
  const { data: planMeals, error: mealsError } = await supabase
    .from('plan_meals')
    .select(`
      recipe_id,
      servings,
      recipes (
        id,
        name,
        recipe_ingredients (
          ingredient,
          amount,
          unit,
          order_index
        )
      )
    `)
    .eq('meal_plan_id', planId)

  if (mealsError || !planMeals) {
    return { error: 'Failed to fetch meal plan recipes' }
  }

  // 3. Aggregate ingredients by category
  const aggregatedIngredients = aggregateIngredients(planMeals)

  // 4. Create grocery list
  const { data: groceryList, error: listError } = await supabase
    .from('grocery_lists')
    .insert({
      user_id: user.id,
      meal_plan_id: planId,
      name: `${plan.name} - Grocery List`,
    })
    .select()
    .single()

  if (listError) {
    return { error: 'Failed to create grocery list' }
  }

  // 5. Insert grocery list items
  const items = aggregatedIngredients.map((item, index) => ({
    list_id: groceryList.id,
    category: categorizeIngredient(item.ingredient),
    ingredient: item.ingredient,
    amount: item.amount,
    unit: item.unit,
    recipe_id: item.recipeId,
    order_index: index,
  }))

  const { error: itemsError } = await supabase
    .from('grocery_list_items')
    .insert(items)

  if (itemsError) {
    return { error: 'Failed to add items to grocery list' }
  }

  revalidatePath(`/plans/${planId}`)
  revalidatePath('/plans')
  return { success: true, listId: groceryList.id }
}

/**
 * Aggregate and combine similar ingredients
 */
function aggregateIngredients(planMeals: any[]): GroceryItem[] {
  const ingredientMap = new Map<string, GroceryItem>()

  planMeals.forEach((meal) => {
    const recipe = meal.recipes
    const servingMultiplier = meal.servings || 1

    recipe?.recipe_ingredients?.forEach((ing: any) => {
      const key = ing.ingredient.toLowerCase().trim()
      const existing = ingredientMap.get(key)

      if (existing) {
        // Combine quantities (simplified - could be more sophisticated)
        existing.amount = combineAmounts(existing.amount, ing.amount, servingMultiplier)
      } else {
        ingredientMap.set(key, {
          category: categorizeIngredient(ing.ingredient),
          ingredient: ing.ingredient,
          amount: multiplyAmount(ing.amount, servingMultiplier),
          unit: ing.unit,
          recipeId: recipe.id,
        })
      }
    })
  })

  return Array.from(ingredientMap.values())
}

/**
 * Categorize ingredient into grocery categories
 */
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase()

  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') ||
      lower.includes('fish') || lower.includes('salmon') || lower.includes('turkey')) {
    return 'protein'
  }
  if (lower.includes('lettuce') || lower.includes('tomato') || lower.includes('onion') ||
      lower.includes('pepper') || lower.includes('carrot') || lower.includes('broccoli')) {
    return 'produce'
  }
  if (lower.includes('cheese') || lower.includes('milk') || lower.includes('yogurt') ||
      lower.includes('butter') || lower.includes('cream')) {
    return 'dairy'
  }
  if (lower.includes('rice') || lower.includes('pasta') || lower.includes('bread') ||
      lower.includes('quinoa') || lower.includes('oats')) {
    return 'grains'
  }
  return 'pantry'
}

/**
 * Multiply ingredient amount by serving multiplier
 */
function multiplyAmount(amount: string, multiplier: number): string {
  // Parse amount (e.g., "1/2", "2", "1.5")
  const match = amount.match(/(\d+)\/(\d+)/)
  if (match) {
    const numerator = parseInt(match[1])
    const denominator = parseInt(match[2])
    const result = (numerator / denominator) * multiplier
    return result.toString()
  }

  const num = parseFloat(amount)
  if (!isNaN(num)) {
    return (num * multiplier).toString()
  }

  return amount // Return as-is if can't parse
}

/**
 * Combine two amounts
 */
function combineAmounts(amount1: string, amount2: string, multiplier: number): string {
  const num1 = parseFloat(amount1)
  const num2 = parseFloat(multiplyAmount(amount2, multiplier))

  if (!isNaN(num1) && !isNaN(num2)) {
    return (num1 + num2).toString()
  }

  return amount1 // Return original if can't combine
}

/**
 * Toggle grocery item checked status
 */
export async function toggleGroceryItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get current checked status
  const { data: item, error: fetchError } = await supabase
    .from('grocery_list_items')
    .select('checked, list_id')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: 'Item not found' }
  }

  // Toggle checked status
  const { error: updateError } = await supabase
    .from('grocery_list_items')
    .update({ checked: !item.checked })
    .eq('id', itemId)

  if (updateError) {
    return { error: 'Failed to update item' }
  }

  revalidatePath(`/grocery-lists/${item.list_id}`)
  return { success: true }
}

/**
 * Add custom item to grocery list
 */
export async function addCustomGroceryItem(
  listId: string,
  ingredient: string,
  amount?: string,
  unit?: string,
  category: string = 'other'
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  if (!ingredient || ingredient.trim().length === 0) {
    return { error: 'Ingredient is required' }
  }

  const { error } = await supabase
    .from('grocery_list_items')
    .insert({
      list_id: listId,
      category,
      ingredient: ingredient.trim(),
      amount: amount?.trim() || '',
      unit: unit?.trim() || '',
      is_custom: true,
      checked: false,
    })

  if (error) {
    return { error: 'Failed to add item' }
  }

  revalidatePath(`/grocery-lists/${listId}`)
  return { success: true }
}

/**
 * Delete grocery list item
 */
export async function deleteGroceryItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const { error } = await supabase
    .from('grocery_list_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    return { error: 'Failed to delete item' }
  }

  return { success: true }
}
```

### UI Components

**File:** `app/grocery-lists/[id]/page.tsx`

```typescript
import { GroceryListView } from '@/components/grocery/grocery-list-view'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function GroceryListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch grocery list with items
  const { data: list, error } = await supabase
    .from('grocery_lists')
    .select(`
      *,
      grocery_list_items (
        id,
        category,
        ingredient,
        amount,
        unit,
        checked,
        is_custom,
        order_index
      )
    `)
    .eq('id', id)
    .single()

  if (error || !list) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GroceryListView list={list} />
    </div>
  )
}
```

**File:** `components/grocery/grocery-list-view.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Check, Plus, Trash2, Share2 } from 'lucide-react'
import { toggleGroceryItem, addCustomGroceryItem, deleteGroceryItem } from '@/app/actions/grocery-lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface GroceryListViewProps {
  list: {
    id: string
    name: string
    grocery_list_items: Array<{
      id: string
      category: string
      ingredient: string
      amount: string
      unit: string
      checked: boolean
      is_custom: boolean
    }>
  }
}

export function GroceryListView({ list }: GroceryListViewProps) {
  const [items, setItems] = useState(list.grocery_list_items)
  const [newItem, setNewItem] = useState('')

  // Group items by category
  const categorizedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const categoryOrder = ['protein', 'produce', 'dairy', 'grains', 'pantry', 'other']
  const categoryLabels = {
    protein: '🥩 Protein',
    produce: '🥬 Produce',
    dairy: '🥛 Dairy',
    grains: '🌾 Grains',
    pantry: '🏪 Pantry',
    other: '📦 Other',
  }

  const handleToggle = async (itemId: string) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ))

    const result = await toggleGroceryItem(itemId)
    if (result.error) {
      toast.error(result.error)
      // Revert on error
      setItems(list.grocery_list_items)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.trim()) return

    const result = await addCustomGroceryItem(list.id, newItem)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Item added')
      setNewItem('')
      // Refresh would happen via router.refresh() in real implementation
    }
  }

  const handleDelete = async (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))

    const result = await deleteGroceryItem(itemId)
    if (result.error) {
      toast.error(result.error)
      setItems(list.grocery_list_items)
    }
  }

  const progress = items.filter(i => i.checked).length / items.length * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{items.filter(i => i.checked).length} of {items.length} items</span>
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
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add custom item..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categorized Items */}
      {categoryOrder.map(category => {
        const categoryItems = categorizedItems[category] || []
        if (categoryItems.length === 0) return null

        return (
          <div key={category} className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="font-bold text-lg mb-3">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h2>

            <div className="space-y-2">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      item.checked
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {item.checked && <Check className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  )
}
```

### Testing Strategy
1. Unit test ingredient aggregation logic
2. Test ingredient categorization accuracy
3. Test amount multiplication and combination
4. Integration test full flow: plan → generate → view → check items
5. Test RLS policies (users can't access others' lists)

**Priority:** 🔴 HIGH - Quick win, high user value
**Estimated Time:** 1-2 days
**Dependencies:** None (uses existing meal_plans table)

---

## Feature 2: Weekly Meal Planning UI 📅

### User Story
> "As a user, I want to view and manage my weekly meal plan in a calendar-like interface so I can easily see what I'm eating each day."

### Acceptance Criteria
- ✅ User can view 7 days of planned meals
- ✅ Each day shows breakfast, lunch, dinner, snacks
- ✅ User can click a meal slot to select a recipe
- ✅ User can remove meals from plan
- ✅ User can drag-and-drop to reorder meals (future enhancement)
- ✅ Plan shows daily macro totals
- ✅ User can navigate between weeks
- ✅ Changes save automatically

### Database Schema Updates

```sql
-- Update meal_plans table to add week tracking
ALTER TABLE meal_plans
ADD COLUMN week_start_date DATE,
ADD COLUMN week_end_date DATE;

-- Update plan_meals to add day and meal type
ALTER TABLE plan_meals
ADD COLUMN day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
ADD COLUMN meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- Index for faster queries
CREATE INDEX idx_plan_meals_day ON plan_meals(meal_plan_id, day_of_week);
```

### Server Actions

**File:** `app/actions/meal-plans.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Create a new weekly meal plan
 */
export async function createWeeklyPlan(
  name: string,
  weekStartDate: string // YYYY-MM-DD format
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Calculate week end date (6 days after start)
  const startDate = new Date(weekStartDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const { data: plan, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: user.id,
      name: name || `Week of ${startDate.toLocaleDateString()}`,
      week_start_date: weekStartDate,
      week_end_date: endDate.toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating plan:', error)
    return { error: 'Failed to create meal plan' }
  }

  revalidatePath('/plans')
  return { success: true, planId: plan.id }
}

/**
 * Add recipe to meal plan slot
 */
export async function addRecipeToPlan(
  planId: string,
  recipeId: string,
  dayOfWeek: number, // 0-6
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Verify user owns the plan
  const { data: plan, error: planError } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    return { error: 'Meal plan not found' }
  }

  // Check if slot already has a recipe
  const { data: existing } = await supabase
    .from('plan_meals')
    .select('id')
    .eq('meal_plan_id', planId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)
    .maybeSingle()

  if (existing) {
    // Update existing slot
    const { error: updateError } = await supabase
      .from('plan_meals')
      .update({ recipe_id: recipeId, servings: 1 })
      .eq('id', existing.id)

    if (updateError) {
      return { error: 'Failed to update meal slot' }
    }
  } else {
    // Insert new slot
    const { error: insertError } = await supabase
      .from('plan_meals')
      .insert({
        meal_plan_id: planId,
        recipe_id: recipeId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        servings: 1,
      })

    if (insertError) {
      return { error: 'Failed to add meal to plan' }
    }
  }

  revalidatePath(`/plans/${planId}`)
  return { success: true }
}

/**
 * Remove recipe from meal plan slot
 */
export async function removeRecipeFromPlan(
  planId: string,
  dayOfWeek: number,
  mealType: string
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const { error } = await supabase
    .from('plan_meals')
    .delete()
    .eq('meal_plan_id', planId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)

  if (error) {
    return { error: 'Failed to remove meal from plan' }
  }

  revalidatePath(`/plans/${planId}`)
  return { success: true }
}

/**
 * Get weekly meal plan with all recipes
 */
export async function getWeeklyPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required', data: null }
  }

  const { data: plan, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      plan_meals (
        id,
        day_of_week,
        meal_type,
        servings,
        recipes (
          id,
          name,
          image_url,
          calories,
          protein_grams,
          carb_grams,
          fat_grams
        )
      )
    `)
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (error || !plan) {
    return { error: 'Meal plan not found', data: null }
  }

  return { success: true, data: plan }
}
```

### UI Component

**File:** `app/plans/[id]/page.tsx`

```typescript
import { WeeklyPlanView } from '@/components/plans/weekly-plan-view'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      plan_meals (
        id,
        day_of_week,
        meal_type,
        servings,
        recipes (
          id,
          name,
          image_url,
          calories,
          protein_grams,
          carb_grams,
          fat_grams
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !plan) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WeeklyPlanView plan={plan} />
    </div>
  )
}
```

**File:** `components/plans/weekly-plan-view.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Plus, Trash2, ShoppingCart, Calendar } from 'lucide-react'
import { addRecipeToPlan, removeRecipeFromPlan } from '@/app/actions/meal-plans'
import { generateGroceryList } from '@/app/actions/grocery-lists'
import { Button } from '@/components/ui/button'
import { RecipeSelector } from './recipe-selector'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export function WeeklyPlanView({ plan }: { plan: any }) {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; meal: string } | null>(null)
  const [isGeneratingGroceryList, setIsGeneratingGroceryList] = useState(false)

  // Organize meals by day and type
  const mealsByDay = DAYS.map((_, dayIndex) => {
    const dayMeals: Record<string, any> = {}
    MEAL_TYPES.forEach(mealType => {
      const meal = plan.plan_meals?.find(
        (m: any) => m.day_of_week === dayIndex && m.meal_type === mealType
      )
      dayMeals[mealType] = meal?.recipes || null
    })
    return dayMeals
  })

  // Calculate daily totals
  const dailyTotals = mealsByDay.map(day => {
    const meals = Object.values(day).filter(Boolean)
    return meals.reduce(
      (acc, meal: any) => ({
        calories: acc.calories + (meal?.calories || 0),
        protein: acc.protein + (meal?.protein_grams || 0),
        carbs: acc.carbs + (meal?.carb_grams || 0),
        fat: acc.fat + (meal?.fat_grams || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  })

  const handleSelectRecipe = async (recipeId: string) => {
    if (!selectedSlot) return

    const result = await addRecipeToPlan(
      plan.id,
      recipeId,
      selectedSlot.day,
      selectedSlot.meal as any
    )

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Recipe added to plan')
      setSelectedSlot(null)
      router.refresh()
    }
  }

  const handleRemoveMeal = async (day: number, mealType: string) => {
    const result = await removeRecipeFromPlan(plan.id, day, mealType)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Meal removed')
      router.refresh()
    }
  }

  const handleGenerateGroceryList = async () => {
    setIsGeneratingGroceryList(true)
    const result = await generateGroceryList(plan.id)
    setIsGeneratingGroceryList(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Grocery list generated!')
      router.push(`/grocery-lists/${result.listId}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{plan.name}</h1>
            <p className="text-sm text-gray-500">
              {plan.week_start_date} to {plan.week_end_date}
            </p>
          </div>
          <Button onClick={handleGenerateGroceryList} disabled={isGeneratingGroceryList}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Generate Grocery List
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Day Header */}
            <div className="bg-primary/10 p-3 border-b">
              <h3 className="font-bold text-sm">{day}</h3>
              <div className="text-xs text-gray-600 mt-1">
                <p>{Math.round(dailyTotals[dayIndex].calories)} cal</p>
              </div>
            </div>

            {/* Meal Slots */}
            <div className="p-2 space-y-2">
              {MEAL_TYPES.map(mealType => {
                const meal = mealsByDay[dayIndex][mealType]

                return (
                  <div
                    key={mealType}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-primary/50 transition-colors group"
                  >
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                      {mealType}
                    </p>

                    {meal ? (
                      <div className="relative">
                        <div className="text-xs font-medium text-gray-900">
                          {meal.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {meal.calories} cal
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(dayIndex, mealType)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSlot({ day: dayIndex, meal: mealType })}
                        className="w-full text-left text-xs text-gray-400 hover:text-primary"
                      >
                        <Plus className="h-4 w-4 mx-auto" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Daily Macros */}
            <div className="bg-gray-50 p-2 border-t">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">P:</span>
                  <span className="font-medium">{Math.round(dailyTotals[dayIndex].protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">C:</span>
                  <span className="font-medium">{Math.round(dailyTotals[dayIndex].carbs)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">F:</span>
                  <span className="font-medium">{Math.round(dailyTotals[dayIndex].fat)}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Selector Modal */}
      {selectedSlot && (
        <RecipeSelector
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSelect={handleSelectRecipe}
        />
      )}
    </div>
  )
}
```

**Priority:** 🔴 HIGH - Core feature
**Estimated Time:** 2-3 days
**Dependencies:** Meal plan generator (can build UI first with manual recipe selection)

---

## Feature 3: Meal Plan Generator (Algorithm-Based) 🤖

### User Story
> "As a user, I want the app to automatically generate a weekly meal plan based on my macro goals so I don't have to manually select recipes."

### Acceptance Criteria
- ✅ User clicks "Generate Plan" from plans page
- ✅ System creates 7-day plan matching user's macro targets (±5%)
- ✅ Plan includes variety (no same recipe twice in a week)
- ✅ Respects dietary preferences (vegetarian, keto, etc.)
- ✅ Balances meals across breakfast/lunch/dinner
- ✅ User can regenerate individual days
- ✅ User can regenerate entire plan

### Algorithm Design

**Approach:** Greedy algorithm with constraints (not AI-based for Phase 2)

```typescript
// Algorithm Pseudocode
function generateWeeklyPlan(userProfile, preferences) {
  const targetDailyMacros = {
    calories: userProfile.target_calories,
    protein: userProfile.protein_grams,
    carbs: userProfile.carb_grams,
    fat: userProfile.fat_grams,
  }

  const weekPlan = []

  for (let day = 0; day < 7; day++) {
    const dayMeals = []
    let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 }

    // Distribute macros across meals (rough split)
    const mealTargets = {
      breakfast: multiplyMacros(targetDailyMacros, 0.25),
      lunch: multiplyMacros(targetDailyMacros, 0.35),
      dinner: multiplyMacros(targetDailyMacros, 0.35),
      snack: multiplyMacros(targetDailyMacros, 0.05),
    }

    // Select recipes for each meal
    for (const [mealType, target] of Object.entries(mealTargets)) {
      const recipe = selectBestRecipe(
        availableRecipes,
        target,
        preferences,
        dayMeals // avoid duplicates
      )

      dayMeals.push({ mealType, recipe })
      dailyTotals = addMacros(dailyTotals, recipe)
    }

    weekPlan.push({ day, meals: dayMeals, totals: dailyTotals })
  }

  return weekPlan
}

function selectBestRecipe(recipes, target, preferences, excludeRecipes) {
  // Filter by dietary preferences
  let candidates = recipes.filter(r => matchesDietaryPreferences(r, preferences))

  // Exclude already used recipes in this week
  candidates = candidates.filter(r => !excludeRecipes.includes(r.id))

  // Score each recipe by macro closeness
  const scored = candidates.map(recipe => ({
    recipe,
    score: calculateMacroScore(recipe, target),
  }))

  // Sort by best score (closest macros)
  scored.sort((a, b) => b.score - a.score)

  // Return top recipe (or random from top 5 for variety)
  const topCandidates = scored.slice(0, 5)
  return topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe
}

function calculateMacroScore(recipe, target) {
  // Lower difference = higher score
  const calDiff = Math.abs(recipe.calories - target.calories)
  const proteinDiff = Math.abs(recipe.protein_grams - target.protein)
  const carbDiff = Math.abs(recipe.carb_grams - target.carbs)
  const fatDiff = Math.abs(recipe.fat_grams - target.fat)

  // Weighted score (protein is most important for fitness)
  const score =
    (1000 - calDiff) * 1.0 +
    (100 - proteinDiff) * 2.0 + // 2x weight for protein
    (100 - carbDiff) * 1.0 +
    (100 - fatDiff) * 1.0

  return Math.max(0, score)
}
```

### Server Actions

**File:** `app/actions/plan-generator.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { createWeeklyPlan, addRecipeToPlan } from './meal-plans'

interface GeneratePlanOptions {
  name?: string
  weekStartDate?: string
}

/**
 * Generate a weekly meal plan for the current user
 */
export async function generateMealPlan(options: GeneratePlanOptions = {}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 1. Get user profile with macro targets
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'User profile not found' }
  }

  if (!profile.target_calories) {
    return { error: 'Please complete onboarding first' }
  }

  // 2. Get all available recipes
  const { data: allRecipes, error: recipesError } = await supabase
    .from('recipes')
    .select(`
      id,
      name,
      calories,
      protein_grams,
      carb_grams,
      fat_grams,
      recipe_tags (tag)
    `)

  if (recipesError || !allRecipes) {
    return { error: 'Failed to fetch recipes' }
  }

  // 3. Filter recipes by dietary preferences
  const dietaryStyle = profile.dietary_style || 'none'
  let availableRecipes = filterRecipesByDiet(allRecipes, dietaryStyle)

  if (availableRecipes.length < 20) {
    return { error: 'Not enough recipes matching your dietary preferences' }
  }

  // 4. Generate 7-day plan
  const weekStartDate = options.weekStartDate || getNextMonday()
  const planName = options.name || `Week of ${new Date(weekStartDate).toLocaleDateString()}`

  const { planId, error: createError } = await createWeeklyPlan(planName, weekStartDate)

  if (createError || !planId) {
    return { error: createError || 'Failed to create plan' }
  }

  // 5. Generate meals for each day
  const targetMacros = {
    calories: profile.target_calories,
    protein: profile.protein_grams,
    carbs: profile.carb_grams,
    fat: profile.fat_grams,
  }

  const mealDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.35,
    snack: 0.05,
  }

  const usedRecipeIds = new Set<string>()

  for (let day = 0; day < 7; day++) {
    for (const [mealType, percentage] of Object.entries(mealDistribution)) {
      const mealTarget = {
        calories: targetMacros.calories * percentage,
        protein: targetMacros.protein * percentage,
        carbs: targetMacros.carbs * percentage,
        fat: targetMacros.fat * percentage,
      }

      // Select best recipe
      const recipe = selectBestRecipe(
        availableRecipes,
        mealTarget,
        Array.from(usedRecipeIds)
      )

      if (!recipe) continue

      // Add to plan
      await addRecipeToPlan(
        planId,
        recipe.id,
        day,
        mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack'
      )

      usedRecipeIds.add(recipe.id)
    }
  }

  return { success: true, planId }
}

/**
 * Filter recipes by dietary style
 */
function filterRecipesByDiet(recipes: any[], dietaryStyle: string) {
  if (dietaryStyle === 'none') return recipes

  return recipes.filter(recipe => {
    const tags = recipe.recipe_tags?.map((t: any) => t.tag) || []

    switch (dietaryStyle) {
      case 'vegetarian':
        return !tags.includes('meat') && !tags.includes('fish')
      case 'vegan':
        return tags.includes('vegan')
      case 'keto':
        return tags.includes('keto') || tags.includes('low-carb')
      case 'paleo':
        return tags.includes('paleo')
      default:
        return true
    }
  })
}

/**
 * Select best recipe for meal slot
 */
function selectBestRecipe(
  recipes: any[],
  target: { calories: number; protein: number; carbs: number; fat: number },
  excludeIds: string[]
) {
  // Filter out already used recipes
  const candidates = recipes.filter(r => !excludeIds.includes(r.id))

  if (candidates.length === 0) return null

  // Score each recipe
  const scored = candidates.map(recipe => ({
    recipe,
    score: calculateMacroScore(recipe, target),
  }))

  // Sort by score (higher is better)
  scored.sort((a, b) => b.score - a.score)

  // Return from top 5 for variety
  const topCandidates = scored.slice(0, Math.min(5, scored.length))
  const randomIndex = Math.floor(Math.random() * topCandidates.length)

  return topCandidates[randomIndex].recipe
}

/**
 * Calculate macro matching score
 */
function calculateMacroScore(
  recipe: any,
  target: { calories: number; protein: number; carbs: number; fat: number }
) {
  const calDiff = Math.abs(recipe.calories - target.calories)
  const proteinDiff = Math.abs(recipe.protein_grams - target.protein)
  const carbDiff = Math.abs(recipe.carb_grams - target.carbs)
  const fatDiff = Math.abs(recipe.fat_grams - target.fat)

  // Weighted scoring (protein is 2x more important)
  const score =
    Math.max(0, 1000 - calDiff) * 1.0 +
    Math.max(0, 100 - proteinDiff) * 2.0 +
    Math.max(0, 100 - carbDiff) * 1.0 +
    Math.max(0, 100 - fatDiff) * 1.0

  return score
}

/**
 * Get next Monday's date
 */
function getNextMonday() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek

  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)

  return nextMonday.toISOString().split('T')[0]
}
```

**Priority:** 🔴 HIGH - Signature feature
**Estimated Time:** 3-4 days
**Dependencies:** Weekly planning UI, recipe database

---

## Feature 4: Stripe Integration & Premium Tier 💳

### User Story
> "As the business owner, I want to charge users for premium features so the app generates revenue."

### Acceptance Criteria
- ✅ Free tier: 3 meal plans max, 10 favorite recipes
- ✅ Premium tier: Unlimited plans, favorites, grocery lists
- ✅ User can upgrade to Premium ($9.99/month or $79.99/year)
- ✅ Stripe checkout flow integrated
- ✅ Subscription status synced via webhooks
- ✅ Premium features gated appropriately
- ✅ User can manage subscription from settings

### Database Schema

```sql
-- Add subscription fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
ADD COLUMN subscription_end_date TIMESTAMPTZ;

-- Create index for Stripe lookups
CREATE INDEX idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);

-- Create subscriptions table for history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('premium')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### Environment Variables

Add to `.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
```

### Server Actions

**File:** `app/actions/stripe.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

/**
 * Create Stripe checkout session for subscription
 */
export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    customerId = customer.id

    // Save customer ID
    await supabase
      .from('user_profiles')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=canceled`,
    metadata: {
      supabase_user_id: user.id,
    },
  })

  if (!session.url) {
    return { error: 'Failed to create checkout session' }
  }

  redirect(session.url)
}

/**
 * Create Stripe portal session for subscription management
 */
export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: 'No subscription found' }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status')
    .eq('user_id', user.id)
    .single()

  return (
    profile?.subscription_tier === 'premium' &&
    profile?.subscription_status === 'active'
  )
}
```

### Webhook Handler

**File:** `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id

      if (!userId) break

      // Update user profile with subscription info
      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'premium',
          subscription_status: 'active',
          stripe_subscription_id: session.subscription as string,
        })
        .eq('user_id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by customer ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!profile) break

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: subscription.status,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('user_id', profile.user_id)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!profile) break

      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('user_id', profile.user_id)

      break
    }
  }

  return NextResponse.json({ received: true })
}
```

### Feature Gating

**File:** `lib/feature-gates.ts`

```typescript
import { createClient } from './supabase/server'

export async function checkPlanLimit(): Promise<{
  canCreate: boolean
  currentCount: number
  limit: number
  isPremium: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { canCreate: false, currentCount: 0, limit: 0, isPremium: false }
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status')
    .eq('user_id', user.id)
    .single()

  const isPremium =
    profile?.subscription_tier === 'premium' &&
    profile?.subscription_status === 'active'

  // Get current plan count
  const { count } = await supabase
    .from('meal_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const limit = isPremium ? Infinity : 3
  const canCreate = isPremium || (count || 0) < limit

  return {
    canCreate,
    currentCount: count || 0,
    limit,
    isPremium,
  }
}

export async function checkFavoriteLimit(): Promise<{
  canAdd: boolean
  currentCount: number
  limit: number
  isPremium: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { canAdd: false, currentCount: 0, limit: 0, isPremium: false }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status')
    .eq('user_id', user.id)
    .single()

  const isPremium =
    profile?.subscription_tier === 'premium' &&
    profile?.subscription_status === 'active'

  const { count } = await supabase
    .from('user_favorite_recipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const limit = isPremium ? Infinity : 10
  const canAdd = isPremium || (count || 0) < limit

  return {
    canAdd,
    currentCount: count || 0,
    limit,
    isPremium,
  }
}
```

### Upgrade Banner Component

**File:** `components/upgrade/premium-gate.tsx`

```typescript
'use client'

import { Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/app/actions/stripe'

interface PremiumGateProps {
  feature: string
  currentCount: number
  limit: number
}

export function PremiumGate({ feature, currentCount, limit }: PremiumGateProps) {
  const handleUpgrade = async (priceId: string) => {
    await createCheckoutSession(priceId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Upgrade to Premium
          </h2>

          <p className="text-gray-600 text-center mb-6">
            You've reached the {feature} limit for free users ({currentCount}/{limit}).
            Upgrade to Premium for unlimited access!
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Unlimited meal plans</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Unlimited favorite recipes</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Unlimited grocery lists</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Priority support</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <Button
              onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!)}
              className="w-full h-12 text-base font-bold relative"
            >
              <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                Save 33%
              </span>
              Annual - $79.99/year
            </Button>
            <Button
              onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)}
              variant="outline"
              className="w-full h-12 text-base font-bold"
            >
              Monthly - $9.99/month
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Priority:** 🔴 HIGH - Required for monetization
**Estimated Time:** 2-3 days
**Dependencies:** None (can be done in parallel)

---

## 4. Testing Strategy

### Unit Tests
- Meal plan generator algorithm (macro matching accuracy)
- Ingredient aggregation logic
- Feature gate checking

### Integration Tests
- Full meal plan generation flow
- Grocery list generation from plan
- Stripe webhook handling
- Premium upgrade/downgrade flow

### E2E Tests (Manual for Phase 2)
1. Generate weekly plan → verify macros within 5%
2. Generate grocery list → verify ingredients aggregated
3. Upgrade to Premium → verify features unlocked
4. Cancel subscription → verify features locked

---

## 5. Implementation Timeline

### Sprint 1: Core Planning (Days 1-7)
**Day 1-2:** Grocery List Generator ✅
- Database migrations
- Server actions (generateGroceryList, toggle, add custom)
- UI component (GroceryListView)
- Testing

**Day 3-5:** Weekly Meal Planning UI ✅
- Update database schema (day_of_week, meal_type)
- Server actions (createWeeklyPlan, addRecipeToPlan, remove)
- WeeklyPlanView component
- Recipe selector modal
- Testing

**Day 6-7:** Meal Plan Generator ✅
- Algorithm implementation (selectBestRecipe, scoring)
- Server action (generateMealPlan)
- Integration with weekly UI
- Testing with various user profiles

### Sprint 2: Monetization (Days 8-13)
**Day 8-9:** Stripe Setup ✅
- Create products and prices in Stripe dashboard
- Database schema (subscription fields)
- Install Stripe SDK
- Environment variables

**Day 10-11:** Stripe Integration ✅
- Checkout session creation
- Webhook handler (subscription events)
- Portal session for management
- Testing with test mode

**Day 12:** Premium Feature Gating ✅
- Feature gate utilities (checkPlanLimit, checkFavoriteLimit)
- Update create plan action to check limits
- Update favorite action to check limits
- PremiumGate modal component

**Day 13:** Testing & Bug Fixes
- End-to-end testing of all features
- Fix any bugs discovered
- Performance optimization

### Sprint 3: Polish & Launch (Days 14-15)
**Day 14:** Final Polish
- UI/UX improvements
- Loading states
- Error handling
- Animations

**Day 15:** Documentation & Deployment
- Update README
- Document new features
- Deploy to production
- Monitor for issues

---

## 6. Deferred Features (Phase 3)

### AI Meal Plan Generation
**Why defer:** Requires OpenAI API costs, complex prompt engineering
**Estimated time:** 4-5 days
**When to implement:** After validating product-market fit

### Social Sharing
**Why defer:** Not core to MVP, adds complexity
**Estimated time:** 3 days
**When to implement:** After reaching 1000 users

### Photo Logging
**Why defer:** Requires storage infrastructure (S3/Cloudinary)
**Estimated time:** 4 days
**When to implement:** Premium feature for Phase 3

---

## 7. Success Metrics

### Technical Metrics
- ✅ Meal plan generation accuracy: ±5% of target macros
- ✅ Plan generation speed: <3 seconds
- ✅ Grocery list generation: <2 seconds
- ✅ Zero critical bugs in production

### Business Metrics
- 🎯 Free to Premium conversion rate: >5%
- 🎯 Monthly Recurring Revenue: $1000 within 3 months
- 🎯 User retention (30 days): >40%
- 🎯 Average meal plans per user: >2

---

## Conclusion

This specification provides a complete roadmap for Phase 2 development. The implementation order balances user value with technical dependencies, ensuring that each feature builds upon previous work.

**Estimated Total Time:** 13-15 days
**Priority Order:**
1. Grocery List Generator (Quick win, high value)
2. Weekly Meal Planning UI (Core feature)
3. Meal Plan Generator (Signature feature)
4. Stripe Integration (Monetization)
5. Premium Feature Gating (Required for freemium model)

All specifications are implementation-ready and follow MacroPlan's existing patterns for authentication, authorization, and database security.
