import Link from 'next/link'
import { Utensils } from 'lucide-react'

export function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-md border-b border-border-strong">
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Utensils className="w-8 h-8 text-primary" />
            <span>Macro Plan</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
            <Link href="/blog" className="text-primary font-semibold transition-colors">Blog</Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
              Sign Up Now
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
