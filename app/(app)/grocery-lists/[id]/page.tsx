import { GroceryListView } from '@/components/grocery/grocery-list-view'
import { getGroceryList } from '@/app/actions/grocery-lists'
import { notFound, redirect } from 'next/navigation'

export default async function GroceryListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getGroceryList(id)

  if (result.error || !result.data) {
    // Check if it's an auth error
    if (result.error === 'Authentication required') {
      redirect('/login')
    }
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GroceryListView list={result.data} />
    </div>
  )
}
