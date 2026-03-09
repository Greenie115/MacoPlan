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
          className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
            selectedCategory === category
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-card text-foreground border border-border-strong hover:border-primary hover:text-primary'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
