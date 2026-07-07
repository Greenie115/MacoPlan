import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

/**
 * Shared fixed header for marketing pages (landing, pricing). Dark
 * charcoal/blur bar pairs with both dark hero and light body sections.
 * Links only — no client state needed.
 */
export function MarketingHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-xl border-b border-white/10"
      role="banner"
    >
      <div className="container mx-auto px-6">
        <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
          <Logo href="/" markSize={30} textClassName="text-xl font-bold tracking-tight text-white" />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium" role="navigation" aria-label="Page sections">
            <Link href="/#how-it-works" className="text-white/60 hover:text-white transition-colors">How it works</Link>
            <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</Link>
            <Link href="/#faq" className="text-white/60 hover:text-white transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground text-sm font-bold py-2.5 px-5 rounded-full transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-px"
            >
              Start free
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
