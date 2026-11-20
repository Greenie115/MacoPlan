import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-data'
import { TrackedLink } from './TrackedLink'

interface BlogSidebarProps {
  currentSlug: string
  relatedPosts: BlogPost[]
  popularPosts: BlogPost[]
}

export function BlogSidebar({ currentSlug, relatedPosts, popularPosts }: BlogSidebarProps) {
  return (
    <aside className="sticky top-24 space-y-6">
      {/* Calculator CTA */}
      <div className="rounded-2xl border border-coral-200 bg-coral-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-foreground font-display">Not sure what your macros are?</h3>
        <p className="mb-4 mt-2 text-sm text-subtle-foreground">
          Get your training-day and rest-day numbers in two minutes. No signup to start.
        </p>
        <TrackedLink
          href="/onboarding/1"
          event={{ location: 'blog-sidebar', post: currentSlug }}
          className="block w-full rounded-lg bg-primary py-2.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-coral-700"
        >
          Work out my macros
        </TrackedLink>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-foreground font-display">Related Posts</h3>
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
          <h3 className="mb-4 text-lg font-bold text-foreground font-display">Start Here</h3>
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
