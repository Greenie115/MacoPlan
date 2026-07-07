import type { BlogPost } from '@/lib/blog-data'

interface AuthorBioProps {
  post: BlogPost
}

export function AuthorBio({ post }: AuthorBioProps) {
  return (
    <div className="flex items-start gap-6 rounded-2xl border border-border-strong bg-muted/50 p-8">
      <img
        src={post.authorImage}
        alt=""
        className="h-20 w-20 flex-shrink-0 rounded-full"
      />
      <div>
        <h3 className="mb-1 text-xl font-bold text-foreground [font-family:var(--font-display)]">{post.author}</h3>
        <p className="leading-relaxed text-subtle-foreground">
          {post.authorBio}
        </p>
      </div>
    </div>
  )
}
