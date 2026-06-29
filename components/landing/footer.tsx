import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo'

export function Footer() {
  return (
    <footer className="py-16 bg-card border-t border-border-strong">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Logo and tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <LogoMark size={28} />
              <span>MacroPlan</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Meal planning for real life.
            </p>
            <Link
              href="/onboarding/1"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-all text-sm"
            >
              Start today
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Column 2: Product & resources */}
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help centre
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <a href="mailto:support@macroplan.app" className="hover:text-primary transition-colors">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-strong pt-8">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} MacroPlan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
