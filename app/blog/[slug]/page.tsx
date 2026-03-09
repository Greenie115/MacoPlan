import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, blogPosts } from '@/lib/blog-data'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { BlogHeader } from '@/components/blog/BlogHeader'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { AuthorBio } from '@/components/blog/AuthorBio'
import { ShareButtons } from '@/components/blog/ShareButtons'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3)

  const popularPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.vercel.app'
  const postUrl = `${baseUrl}/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <BlogHeader />

      <main className="pt-32 pb-20">
        <article className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-subtle-foreground mb-8 max-w-5xl mx-auto">
            <Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span>/</span>
            <span>{post.category}</span>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{post.title}</span>
          </div>

          {/* Two-column layout on desktop */}
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Category Badge */}
              <div className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                {post.category}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                {post.title}
              </h1>

              {/* Author Info Row */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-subtle-foreground mb-8 pb-8 border-b border-border-strong">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorImage}
                    alt={post.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{post.author}</div>
                  </div>
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

              {/* Featured Image */}
              <div className="mb-12 rounded-2xl overflow-hidden shadow-lg aspect-video">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-subtle-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Bio Box */}
              <div className="mb-12">
                <AuthorBio post={post} />
              </div>

              {/* Share Section */}
              <ShareButtons title={post.title} url={postUrl} />

              {/* CTA Banner */}
              <div className="mt-16 bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
                  Ready to put your meal planning on autopilot?
                </h2>
                <p className="text-primary-foreground/90 mb-6 relative z-10">
                  Get personalized meal plans that hit your macros perfectly.
                </p>
                <Link
                  href="/signup"
                  className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-xl hover:bg-white/90 transition-colors shadow-lg relative z-10"
                >
                  Generate My Free Plan
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BlogSidebar relatedPosts={relatedPosts} popularPosts={popularPosts} />
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-muted border-t border-border-strong">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MacroPlan</h3>
              <p className="text-subtle-foreground text-sm">
                Personalized meal plans that fit your macros and your lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-subtle-foreground">
                <li>
                  <a href="/#features" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-subtle-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-subtle-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm border-t border-border-strong pt-8">
            <p>© 2025 MacroPlan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
