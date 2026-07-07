import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-data'
import { ArrowRight } from 'lucide-react'

interface FeaturedPostProps {
  post: BlogPost
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border-strong bg-card shadow-md transition-all duration-base ease-out-quint hover:-translate-y-0.5 hover:shadow-xl focus-visible:-translate-y-0.5 focus-visible:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:grid-cols-2"
    >
      <div className="relative aspect-video overflow-hidden bg-muted md:aspect-auto">
        <img
          src={post.image}
          alt={post.title}
          loading="eager"
          className="h-full w-full object-cover transition-transform duration-slow ease-out-quint group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="flex items-center gap-3">
          <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
            Featured
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-coral-700">
            {post.category}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground [font-family:var(--font-display)] [text-wrap:balance] md:text-3xl lg:text-display-md">
          {post.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-subtle-foreground line-clamp-3 md:text-lg">
          {post.excerpt}
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{post.date}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readTime}</span>
        </div>
        <div className="mt-6 flex items-center gap-2 font-semibold text-coral-700">
          Read the story
          <ArrowRight className="h-5 w-5 transition-transform duration-base ease-out-quint group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </Link>
  )
}
