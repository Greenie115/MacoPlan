import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost } from '@/lib/blog-data'
import { ArrowLeft, Calendar, Clock, Share2, MessageSquare, User } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
       <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-primary">MacroPlan</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/blog" className="text-sm font-medium text-primary transition-colors">Blog</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          </nav>
          <div className="flex items-center gap-4">
             <Link href="/signup" className="bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-opacity text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <article className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-subtle-foreground mb-8">
            <Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{post.category}</span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-subtle-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg aspect-video">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-subtle-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share & Comments Placeholder */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Share this post</h3>
              <div className="flex gap-4">
                <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <footer className="py-12 bg-muted border-t border-border mt-12">
        <div className="container mx-auto px-6 text-center text-subtle-foreground">
          <p>© 2024 MacroPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
