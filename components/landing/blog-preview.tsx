import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'

export function BlogPreview() {
  // Get the first 3 blog posts
  const featuredPosts = blogPosts.slice(0, 3)

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          From our experts
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredPosts.map((post) => (
            <article
              key={post.slug}
              className="group bg-card rounded-2xl border border-border-strong overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  {post.category}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary font-medium text-sm hover:underline"
                >
                  Read more on Macro Plan blog ›
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  )
}
