'use client'

import { ChevronDown } from 'lucide-react'

export function FAQSection() {
  const faqs = [
    {
      question: 'Is MacroPlan really free to start?',
      answer: 'Yes! You can create your first meal plan completely free. No credit card required. Our free tier gives you access to basic meal planning features. Upgrade to Pro for unlimited meal plans, custom recipes, and advanced features.',
    },
    {
      question: 'How is this different from MyFitnessPal?',
      answer: 'MyFitnessPal is a tracking app—you log what you already ate. MacroPlan tells you what TO eat. We generate complete meal plans that hit your exact macros, so you never have to guess or manually track. Think of us as the planning tool, not just the tracking tool.',
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
    <section className="border-t border-border-strong bg-card py-24 md:py-32" id="faq">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <h2 className="text-display-lg font-extrabold leading-[1.05]">Questions? We&apos;ve got answers.</h2>

        <div>
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-t border-border-strong py-5 last:border-b [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold transition-colors duration-fast hover:text-coral-700">
                {faq.question}
                <ChevronDown className="size-5 shrink-0 text-icon transition-transform duration-base ease-out-quint group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
