'use client'

import { ChevronDown } from 'lucide-react'

export function FAQSection() {
  const faqs = [
    {
      question: 'Is Macro Plan really free to start?',
      answer: 'Yes! You can create your first meal plan completely free. No credit card required. Our free tier gives you access to basic meal planning features. Upgrade to Pro for unlimited meal plans, custom recipes, and advanced features.',
    },
    {
      question: 'How is this different from MyFitnessPal?',
      answer: 'MyFitnessPal is a tracking app—you log what you already ate. Macro Plan tells you what TO eat. We generate complete meal plans that hit your exact macros, so you never have to guess or manually track. Think of us as the planning tool, not just the tracking tool.',
    },
    {
      question: 'Can I customize meals for dietary restrictions?',
      answer: 'Absolutely! During setup, you can specify vegetarian, vegan, gluten-free, dairy-free, keto, paleo, and more. You can also exclude specific ingredients you don\'t like or are allergic to. Every meal plan is personalized to your preferences.',
    },
    {
      question: 'What if I don\'t like a meal in my plan?',
      answer: 'Just tap the swap button! We\'ll instantly replace it with another meal that fits your macros and preferences. You can swap unlimited times on the Pro plan. No more forcing yourself to eat food you don\'t enjoy.',
    },
    {
      question: 'How long does it take to generate a meal plan?',
      answer: 'About 3 seconds. Seriously. Just tell us your goals, preferences, and dietary restrictions, and our AI generates a full week of meals instantly. No more spending hours searching for recipes or calculating macros.',
    },
  ]

  return (
    <section className="py-24 bg-background" id="faq">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Questions? We&apos;ve got answers.</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-card p-6 rounded-xl border border-border-strong hover:shadow-lg transition-shadow [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                {faq.question}
                <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
              </summary>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
