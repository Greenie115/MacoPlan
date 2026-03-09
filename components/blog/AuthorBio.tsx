import type { BlogPost } from '@/lib/blog-data'

interface AuthorBioProps {
  post: BlogPost
}

export function AuthorBio({ post }: AuthorBioProps) {
  return (
    <div className="bg-muted/50 rounded-2xl border border-border-strong p-8 flex gap-6 items-start">
      <img
        src={post.authorImage}
        alt={post.author}
        className="w-20 h-20 rounded-full flex-shrink-0"
      />
      <div>
        <h3 className="text-xl font-bold mb-1">{post.author}</h3>
        <p className="text-subtle-foreground leading-relaxed">
          {post.authorBio}
        </p>
      </div>
    </div>
  )
}
