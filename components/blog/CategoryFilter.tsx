'use client'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          aria-pressed={selectedCategory === category}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-base ease-out-quint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            selectedCategory === category
              ? 'bg-coral-600 text-white shadow-coral'
              : 'border border-border-strong bg-coral-50 text-coral-700 hover:border-coral-200 hover:bg-coral-100'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
