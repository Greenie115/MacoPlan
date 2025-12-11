import Link from 'next/link'
import { blogPosts } from '@/lib/blog-data'
import { ArrowRight } from 'lucide-react'

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border-strong bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-primary">MacroPlan</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/blog" className="text-sm font-semibold text-primary transition-colors">Blog</Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">MacroPlan Blog</h1>
            <p className="text-lg text-subtle-foreground">
              Get tips, tricks, and delicious recipes to help you on your health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-card text-card-foreground rounded-2xl shadow-lg border border-border-strong overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">{post.category}</div>
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
            ))}
          </div>
        </div>
      </main>

      <footer className="py-12 bg-muted border-t border-border-strong">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 MacroPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
