import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function RecipeNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-orange-100 p-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Recipe Not Found</h1>
        <p className="text-gray-600">
          We couldn't find the recipe you're looking for. It may have been
          removed or doesn't exist.
        </p>
        <Link
          href="/recipes"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to Recipes
        </Link>
      </div>
    </div>
  )
}
