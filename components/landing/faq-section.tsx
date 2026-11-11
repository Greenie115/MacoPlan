'use client'

import { ChevronDown } from 'lucide-react'

export function FAQSection() {
  const faqs = [
    {
      question: 'Is MacroPlan really free to start?',
      answer: 'Yes. Your first 3 prep plans are free and you don\u2019t need a card. Premium lifts that to 100 plans a month.',
    },
    {
      question: 'How is this different from MyFitnessPal?',
      answer: 'A tracker tells you what you already ate. MacroPlan tells you what to cook, so the numbers are right before you eat, not a surprise at 9pm when you\u2019re 60g of protein short.',
    },
    {
      question: 'Can I customize meals for dietary restrictions?',
      answer: 'Yes. Choose vegetarian, vegan, pescatarian, keto or paleo, and list any ingredients to leave out. Excluded ingredients never appear in a plan.',
    },
    {
      question: 'What if I don\u2019t like a meal in my plan?',
      answer: 'Build a new plan. It steers away from recipes in your recent plans, and you can exclude any ingredient you never want to see again.',
    },
    {
      question: 'How long does it take to build a plan?',
      answer: 'A few seconds. Enter your targets, prep day and container count, and the whole plan comes back: recipes, portions, cooking order and shopping list.',
    },
  ]

  return (
    <section className="border-t border-border-strong bg-card py-24 md:py-32" id="faq">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <h2 className="text-display-lg font-extrabold leading-[1.05]">Still not sure?</h2>

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
