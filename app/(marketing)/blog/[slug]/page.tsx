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

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
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
      // Social crawlers don't render SVG og:images — fall back to the
      // root /opengraph-image (PNG) for SVG covers.
      images: post.image && !post.image.endsWith('.svg') ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/blog/${slug}`,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://macroplan.app'
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MacroPlan',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="grid lg:grid-cols-3 items-start gap-8 lg:gap-12 max-w-7xl mx-auto">
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
                    className="w-10 h-10 rounded-full bg-muted object-cover"
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
              <figure className="mb-12">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
                {post.imageCredit && (
                  <figcaption className="mt-2 text-xs text-muted-foreground text-right">
                    <a
                      href={post.imageCreditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {post.imageCredit}
                    </a>
                  </figcaption>
                )}
              </figure>

              {/* Article Content */}
              <div
                className="prose prose-lg dark:prose-invert mx-auto max-w-[68ch] prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight prose-h2:mt-14 prose-h2:mb-5 prose-h3:mt-10 prose-h3:mb-3 prose-p:text-foreground/85 prose-li:text-foreground/85 prose-li:my-1 prose-li:marker:text-primary prose-strong:text-foreground prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border prose-blockquote:border-primary/20 prose-blockquote:rounded-xl prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-foreground mb-12"
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
                  href="/onboarding/1"
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
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
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
                  <Link href="/#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-subtle-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Centre
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm border-t border-border-strong pt-8">
            <p>© 2026 MacroPlan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
