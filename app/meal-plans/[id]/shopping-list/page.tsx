import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getShoppingList } from '@/app/actions/shopping-lists'
import ShoppingListView from '@/components/meal-plans/shopping-list-view'

export const metadata: Metadata = {
  title: 'Shopping List | MacroPlan',
  description: 'Your meal plan shopping list',
}

export default async function ShoppingListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Next.js 16: params is now a Promise
  const { id } = await params
  const result = await getShoppingList(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ShoppingListView shoppingList={result.data} mealPlanId={id} />
    </div>
  )
}
