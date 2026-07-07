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
      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-subtle-foreground">
            No posts found in this category.
          </p>
        </div>
      )}
    </>
  )
}
