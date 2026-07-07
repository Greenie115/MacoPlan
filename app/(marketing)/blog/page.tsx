import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { blogPosts } from '@/lib/blog-data'
import { MarketingHeader } from '@/components/landing/marketing-header'
import { Footer } from '@/components/landing/footer'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { EmailCapture } from '@/components/blog/EmailCapture'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert nutrition tips, meal planning guides, and macro tracking advice from the MacroPlan team.',
  openGraph: {
    title: 'MacroPlan Blog - Nutrition Tips & Meal Planning Guides',
    description: 'Expert nutrition tips, meal planning guides, and macro tracking advice.',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogIndexPage() {
  const featuredPost = blogPosts[0]

  return (
    <div className={`${display.variable} min-h-screen bg-background text-foreground font-sans`}>
      <MarketingHeader />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h1 className="text-display-lg font-extrabold tracking-tight text-foreground [font-family:var(--font-display)] [text-wrap:balance]">
              The MacroPlan Blog
            </h1>
            <p className="mt-4 text-lg text-subtle-foreground">
              Practical, evidence-informed guides for lifters who track macros and meal-prep their week.
            </p>
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <FeaturedPost post={featuredPost} />
          </div>

          {/* Category Filter & Post Grid */}
          <BlogGrid posts={blogPosts} featuredSlug={featuredPost.slug} />
        </div>
      </main>

      <EmailCapture />
      <Footer />
    </div>
  )
}
