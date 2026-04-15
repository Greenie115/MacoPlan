import Link from 'next/link'
import { Utensils, ArrowRight, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-16 bg-card border-t border-border-strong">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Logo and tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Utensils className="w-7 h-7 text-primary" aria-hidden="true" />
              <span>Macro Plan</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Meal planning for real life.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-all text-sm"
            >
              Start Today
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-primary transition-colors">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
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
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-strong pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Macro Plan. All rights reserved.
            </p>

            {/* Contact */}
            <a
              href="mailto:support@macroplan.app"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              support@macroplan.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
