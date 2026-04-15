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
      className="group bg-card text-card-foreground rounded-2xl shadow-lg border border-border-strong overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
          {post.category}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-subtle-foreground flex-grow line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 font-semibold text-primary flex items-center gap-1">
          Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
