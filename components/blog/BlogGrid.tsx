'use client'

import { useState, useMemo } from 'react'
import type { BlogPost } from '@/lib/blog-data'
import { CategoryFilter } from './CategoryFilter'
import { BlogCard } from './BlogCard'

interface BlogGridProps {
  posts: BlogPost[]
  featuredSlug: string
}

export function BlogGrid({ posts, featuredSlug }: BlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(posts.map((post) => post.category)))
    return ['All', ...uniqueCategories.sort()]
  }, [posts])

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => post.slug !== featuredSlug)
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }
    return filtered
  }, [posts, selectedCategory, featuredSlug])

  return (
    <>
      {/* Category Filter */}
      <div className="mb-12">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Post Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-subtle-foreground text-lg">
            No posts found in this category.
          </p>
        </div>
      )}
    </>
  )
}
