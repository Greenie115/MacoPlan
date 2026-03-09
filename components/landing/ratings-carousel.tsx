'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

const reviews = [
  {
    quote: "Helped me get moving on my goals and tracking my weight loss journey.",
    name: "Jason L."
  },
  {
    quote: "Good for tracking calories and macros with a huge database of recipes.",
    name: "Iain M."
  },
  {
    quote: "Friendly, easy-to-use app that keeps me accountable.",
    name: "Dinah L."
  },
  {
    quote: "Can't lose weight and stay on track without it.",
    name: "Jennie S."
  },
  {
    quote: "Love this app. It keeps me on track with my nutritional goals.",
    name: "Annette B."
  },
  {
    quote: "Finally hit my protein goals consistently. Game changer!",
    name: "Marcus T."
  },
]

export function RatingsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-muted/30 border-y border-border-strong">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Star rating display */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-8 h-8 fill-yellow-400 text-yellow-400"
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Rating headline */}
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="text-primary">10,000+</span>{' '}
            <span className="text-foreground">5-Star Reviews</span>
          </h2>

          {/* Testimonial carousel */}
          <div className="relative h-24 overflow-hidden">
            {reviews.map((review, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                  index === activeIndex
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <p className="text-lg md:text-xl text-muted-foreground italic mb-2">
                  "{review.quote}"
                </p>
                <p className="font-semibold text-foreground">{review.name}</p>
              </div>
            ))}
          </div>

          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
