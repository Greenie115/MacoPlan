import { blogPosts } from '@/lib/blog-data'
import { BlogHeader } from '@/components/blog/BlogHeader'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { EmailCapture } from '@/components/blog/EmailCapture'

export default function BlogIndexPage() {
  const featuredPost = blogPosts[0]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <BlogHeader />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Hero Section - Featured Post */}
          <div className="mb-20">
            <FeaturedPost post={featuredPost} />
          </div>

          {/* Category Filter & Post Grid */}
          <BlogGrid posts={blogPosts} featuredSlug={featuredPost.slug} />
        </div>
      </main>

      {/* Email Capture Section */}
      <EmailCapture />

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
