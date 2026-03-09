import { Check } from 'lucide-react'
import Link from 'next/link'

export function FinalCTA() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground rounded-3xl p-10 md:p-20 text-center shadow-2xl shadow-primary/30 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[length:30px_30px]"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your meals for the week. Ready in 3 seconds.
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop spending hours on meal prep and tracking. Join 10,000+ busy professionals who eat better with less effort.
            </p>

            <Link
              href="/signup"
              className="inline-block bg-white text-primary font-bold py-5 px-12 rounded-xl hover:bg-white/95 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
            >
              Generate My Free Plan
            </Link>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>7-day meal plan in seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
