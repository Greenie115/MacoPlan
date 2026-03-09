import { Target, Sparkles, UtensilsCrossed } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: Target,
      title: 'Tell us your goals',
      description: 'Answer a few quick questions about your fitness goals, dietary preferences, and lifestyle. It takes less than 60 seconds.',
    },
    {
      number: '2',
      icon: Sparkles,
      title: 'Get your personalized plan',
      description: 'Our AI generates a complete week of meals tailored to your exact macros, preferences, and dietary restrictions.',
    },
    {
      number: '3',
      icon: UtensilsCrossed,
      title: 'Enjoy and track',
      description: 'Follow your plan, swap meals you don\'t love, and hit your goals without the guesswork. It\'s that simple.',
    },
  ]

  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">
            Get your personalized meal plan in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card p-8 rounded-2xl border border-border-strong hover:shadow-lg transition-shadow text-center"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {step.number}
              </div>

              <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-2">
                <step.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border-strong" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
