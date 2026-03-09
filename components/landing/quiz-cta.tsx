import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function QuizCTA() {
  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div>
            <p className="text-primary-foreground/70 font-semibold uppercase tracking-wide text-sm mb-4">
              Get Started
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Starting is the hard part. We make it easy...
            </h2>
            <Link
              href="/onboarding/1"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              <span>Take the quiz</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Quiz preview mockup */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-sm font-medium text-primary-foreground/70 mb-4">
                Question 1 of 6
              </div>
              <h3 className="text-xl font-bold mb-6">
                What's your primary fitness goal?
              </h3>
              <div className="space-y-3">
                {['Lose weight', 'Build muscle', 'Maintain weight', 'Eat healthier'].map((option, i) => (
                  <div
                    key={option}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      i === 0
                        ? 'border-white bg-white/20'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        i === 0 ? 'border-white' : 'border-white/50'
                      }`}>
                        {i === 0 && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className={i === 0 ? 'font-medium' : 'text-primary-foreground/80'}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -z-10 -bottom-8 -right-8 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
