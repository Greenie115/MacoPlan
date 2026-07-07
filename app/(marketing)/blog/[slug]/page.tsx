import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { getBlogPost, blogPosts } from '@/lib/blog-data'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { MarketingHeader } from '@/components/landing/marketing-header'
import { Footer } from '@/components/landing/footer'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { AuthorBio } from '@/components/blog/AuthorBio'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { ReadingProgress } from '@/components/blog/ReadingProgress'

// ponytail: post.content is authored in lib/blog-data.ts by the team, not
// user-submitted — dangerouslySetInnerHTML here predates this change and is
// a known, accepted risk (see project memory) tracked for a future CMS move.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

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
      <div className={`${display.variable} min-h-screen bg-background text-foreground font-sans`}>
        <MarketingHeader />
        <ReadingProgress />

        <main className="pb-20 pt-32">
          <article className="container mx-auto px-6">
            {/* Breadcrumb */}
            <div className="mx-auto mb-8 flex max-w-3xl items-center gap-2 text-sm text-subtle-foreground">
              <Link href="/blog" className="flex items-center gap-2 transition-colors hover:text-coral-700">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Blog
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate text-foreground font-medium">{post.category}</span>
            </div>

            {/* Article Header */}
            <header className="mx-auto mb-10 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral-700">
                {post.category}
              </span>
              <h1 className="text-display-lg font-extrabold leading-[1.08] tracking-tight text-foreground [font-family:var(--font-display)] [text-wrap:balance]">
                {post.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-subtle-foreground">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorImage}
                    alt=""
                    className="h-7 w-7 rounded-full bg-muted object-cover"
                  />
                  <span className="font-medium text-foreground">{post.author}</span>
                </div>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>
            </header>

            {/* Featured Image */}
            <figure className="mx-auto mb-12 max-w-5xl">
              <div className="aspect-video overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </div>
              {post.imageCredit && (
                <figcaption className="mt-2 text-right text-xs text-muted-foreground">
                  <a
                    href={post.imageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {post.imageCredit}
                  </a>
                </figcaption>
              )}
            </figure>

            {/* Two-column layout on desktop */}
            <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-3 lg:gap-12">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Article Content — measure capped at ~70ch via prose-lg */}
                <div
                  className="prose prose-lg dark:prose-invert mx-auto max-w-[70ch] prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:[font-family:var(--font-display)] prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-2xl prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/85 prose-li:my-1 prose-li:text-foreground/85 prose-li:marker:text-coral-500 prose-strong:text-foreground prose-a:font-medium prose-a:text-coral-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:rounded-xl prose-blockquote:border prose-blockquote:border-coral-200 prose-blockquote:bg-coral-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:text-foreground prose-code:text-coral-700 prose-code:before:content-none prose-code:after:content-none mb-12"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Author Bio Box */}
                <div className="mb-12">
                  <AuthorBio post={post} />
                </div>

                {/* Share Section */}
                <ShareButtons title={post.title} url={postUrl} />

                {/* CTA Banner */}
                <div className="relative mt-16 overflow-hidden rounded-2xl bg-charcoal p-8 text-center shadow-xl md:p-12">
                  <div className="premium-mesh" aria-hidden="true" />
                  <div className="grain-overlay" aria-hidden="true" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white [font-family:var(--font-display)] md:text-3xl">
                      Ready to put your meal planning on autopilot?
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-white/80">
                      Get personalized meal plans that hit your macros perfectly.
                    </p>
                    <Link
                      href="/onboarding/1"
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-bold text-primary-foreground shadow-coral transition-all duration-base ease-out-quint hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      Start for free
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <BlogSidebar relatedPosts={relatedPosts} popularPosts={popularPosts} />
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  )
}
