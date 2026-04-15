'use client'

import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-data'
import { useState } from 'react'

interface BlogSidebarProps {
  relatedPosts: BlogPost[]
  popularPosts: BlogPost[]
}

export function BlogSidebar({ relatedPosts, popularPosts }: BlogSidebarProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <aside className="space-y-6 sticky top-24">
      {/* Lead Magnet Box */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
        <div className="text-3xl mb-3">📧</div>
        <h3 className="text-xl font-bold mb-2">Get the Guide</h3>
        <p className="text-sm text-subtle-foreground mb-4">
          Free Macro Calculator PDF
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors"
          >
            Download
          </button>
        </form>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-card border border-border-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Related Posts</h3>
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  {post.category}
                </div>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="bg-card border border-border-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Popular Posts</h3>
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  {post.category}
                </div>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
