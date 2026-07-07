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
    <aside className="sticky top-24 space-y-6">
      {/* Lead Magnet Box */}
      <div className="rounded-2xl border border-coral-200 bg-coral-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground [font-family:var(--font-display)]">Get the Guide</h3>
        <p className="mb-4 mt-2 text-sm text-subtle-foreground">
          Free Macro Calculator PDF
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="sidebar-email" className="sr-only">
            Email address
          </label>
          <input
            id="sidebar-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full rounded-lg border border-border-strong bg-background px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Download
          </button>
        </form>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-foreground [font-family:var(--font-display)]">Related Posts</h3>
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral-700">
                  {post.category}
                </div>
                <h4 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-coral-700">
                  {post.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-foreground [font-family:var(--font-display)]">Popular Posts</h3>
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral-700">
                  {post.category}
                </div>
                <h4 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-coral-700">
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
