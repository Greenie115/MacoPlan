'use client'

import { Target, Sparkles, UtensilsCrossed } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Tell us your goals',
    description: 'Answer a few quick questions about your fitness goals, dietary preferences, and lifestyle. Takes less than 60 seconds.',
    icon: Target,
    image: (
      <div className="bg-card rounded-2xl border border-border-strong p-6 shadow-lg">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Goal</div>
          <div className="space-y-2">
            {['Lose weight', 'Build muscle', 'Maintain weight', 'Eat healthier'].map((goal, i) => (
              <div
                key={goal}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  i === 0 ? 'border-primary bg-primary/5' : 'border-border-strong hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    i === 0 ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {i === 0 && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>{goal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '2',
    title: 'Get your personalized plan',
    description: 'Our AI generates a complete week of meals tailored to your exact macros, preferences, and dietary restrictions.',
    icon: Sparkles,
    image: (
      <div className="bg-card rounded-2xl border border-border-strong p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Weekly Meal Plan</div>
          <div className="text-xs text-primary font-medium">Generated in 3s</div>
        </div>
        <div className="space-y-3">
          {[
            { day: 'Monday', meal: 'Greek Yogurt Parfait', cal: 320 },
            { day: 'Tuesday', meal: 'Chicken Caesar Wrap', cal: 450 },
            { day: 'Wednesday', meal: 'Salmon Quinoa Bowl', cal: 520 },
          ].map((item) => (
            <div key={item.day} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div>
                <div className="text-xs text-muted-foreground">{item.day}</div>
                <div className="font-medium text-sm">{item.meal}</div>
              </div>
              <div className="text-sm font-semibold text-primary">{item.cal} cal</div>
            </div>
          ))}
          <div className="text-center text-xs text-muted-foreground pt-2">+ 4 more days...</div>
        </div>
      </div>
    ),
  },
  {
    number: '3',
    title: 'Eat better and hit your goals',
    description: 'Follow your plan, swap meals you don\'t love, and track your progress. Flexibility built in for real life.',
    icon: UtensilsCrossed,
    image: (
      <div className="bg-card rounded-2xl border border-border-strong p-6 shadow-lg">
        <div className="text-sm font-semibold mb-4">Weekly Progress</div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Calories</span>
              <span className="font-semibold">1,847 / 2,000</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: '92%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Protein</span>
              <span className="font-semibold text-protein">142g / 150g</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-protein rounded-full" style={{ width: '95%' }} />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-success text-lg">✓</span>
            </div>
            <span className="font-medium">On track for your goal!</span>
          </div>
        </div>
      </div>
    ),
  },
]

export function HowItWorksV2() {
  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Hit your goals in <span className="text-primary">1-2-3</span>
          </h2>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Image/Mockup */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative">
                  {step.image}
                  {/* Decorative blur */}
                  <div className={`absolute -z-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl ${
                    index % 2 === 0 ? '-bottom-8 -right-8' : '-bottom-8 -left-8'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
