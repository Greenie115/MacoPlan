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
      className="group grid md:grid-cols-2 gap-8 bg-card rounded-2xl border border-border-strong shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <div className="inline-block w-fit text-xs font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          Featured
        </div>
        <div className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">
          {post.category}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="text-subtle-foreground text-lg mb-6 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 font-semibold text-primary">
          Read Article <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
