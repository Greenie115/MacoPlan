import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-data'
import { ArrowRight } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-card shadow-sm transition-all duration-base ease-out-quint hover:-translate-y-0.5 hover:border-coral-200 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-slow ease-out-quint group-hover:scale-105"
        />
      </div>
      <div className="flex flex-grow flex-col p-6">
        <span className="w-fit rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral-700">
          {post.category}
        </span>
        <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-foreground [font-family:var(--font-display)] group-hover:text-coral-700">
          {post.title}
        </h3>
        <p className="mt-2 flex-grow text-sm leading-relaxed text-subtle-foreground line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-border-strong pt-4 text-xs text-muted-foreground">
          <span>{post.date}</span>
          <span className="flex items-center gap-1 font-semibold text-coral-700">
            {post.readTime}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out-quint group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
