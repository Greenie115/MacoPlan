'use client'

import { useState, useEffect } from 'react'

const testimonials = [
  {
    quote: "Macro Plan helped me gain muscle, get a 6-pack, and simply achieve all my body goals.",
    highlight: "simply achieve all my body goals",
    name: "Synthia J.",
    result: "Gained 8 lbs muscle"
  },
  {
    quote: "I was 230 lbs, and today I am 185 lbs. Macro Plan taught me how proper nutrition and exercise are essential. I still use it everyday.",
    highlight: "proper nutrition and exercise are essential",
    name: "Larry S.",
    result: "Lost 45 lbs"
  },
  {
    quote: "Once I started focusing on providing my body with nutrition for the purpose of building strength, my body has completely changed. More importantly, I'm feeling confident and empowered with who I am.",
    highlight: "I'm feeling confident and empowered with who I am",
    name: "Brooke N.",
    result: "Transformed mindset"
  },
  {
    quote: "My biggest realization with Macro Plan was being able to understand the food I ate... we don't need to jump on some diet fad, but understand our goals and adjust our calories and macros to achieve those goals.",
    highlight: "being able to understand the food I ate",
    name: "Rohit S.",
    result: "Lost 30 lbs"
  },
  {
    quote: "The biggest realization is that I can do better. It is actually possible to eat healthy, and the food can taste good. Macro Plan helped me overhaul my habits.",
    highlight: "Macro Plan helped me overhaul my habits",
    name: "Quincy D.",
    result: "Healthier lifestyle"
  },
]

const successImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA8PdGSF7nBk5bfTB7NIfrvHDDXNrZL-uIWp5alk7v4TkY3MBhCji-tv2bP8p1p6sjYQTQxGko6of3Ucp3svQx-xOCzXXS1S3_2-rfDDBCJFnv1oiE22Jbw9zM_kVNOJAUb-wkGE2xPN2K3SnWh0sUamgVs2QkJt3xJ58v0eq2K3hnWBLJ1s8C1xBH316FfaqcJ3ncMxxsDU84afiQ_bYl6WE6TwxkpRSFVvv3pLZcl4ScSKAkRwXqUVnU3lOXC4WjX5DzB8bNjaRpn',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBy2qkIlgWNi97-STrMsqkmB095Ajh_Ut7kQEmBkDZVMPmqDz9rCtBf5NrGQFRfGjYicMOpKLZccZydWxLMF2WFjFLYF5vbmwf57-6KODUSodBb7Uh1pKqV3vMHlGJct2UQ41ZBfdWLN8YquaIsMmCeFyjNZU0sWpzsZjLlaMfhLIJJigxIkBoaba7ZWm4ZRsNIndLexb-1ftvhrdZ5m6Z9vY-SZrdwMXDcl8cTIJ9xmJZB_cfWNjLkxDAFha4cVm3f-zFSX67wYsM3',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5k-rcxAHlKYLJGvgx8rarWIAOEhspwRmeNGsaKiY2SGyU1AkxbkdZVelTL1Uz6TRrGcPp7R98iAFrdYSU30DgCOguVi66FfoRPINMlSqOAC4HoDzdOuT-7R2OmaOjAIA2F3GfIpmLby1gEId3braJNZb2Uc1h5qCADZlD344VDxcnw7vb6_G7gXThCDq_TsCoBYouWPb8Sf1dMskdoTgTE533GcwkdjRpbvmCLZPTWyDNb3r8mS5Tzm5XyKQj6vMJoFECE1UkxqM5',
]

export function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatQuote = (quote: string, highlight: string) => {
    const parts = quote.split(highlight)
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}<strong className="text-foreground">{highlight}</strong>{parts[1]}
        </>
      )
    }
    return quote
  }

  return (
    <section className="py-24 bg-muted/30" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-4">
          <p className="text-primary font-semibold uppercase tracking-wide text-sm">Get Results</p>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Meal planning works, here's the proof
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Photo collage */}
          <div className="grid grid-cols-3 gap-3">
            {successImages.map((img, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl ${
                  index === 1 ? 'row-span-2' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`Success story ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
            {/* Additional placeholder images */}
            <div className="bg-primary/20 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">💪</span>
            </div>
            <div className="bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🎯</span>
            </div>
          </div>

          {/* Testimonial carousel */}
          <div>
            <div className="relative min-h-[280px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === activeIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-8 pointer-events-none'
                  }`}
                >
                  <div className="bg-card rounded-2xl p-8 border border-border-strong shadow-lg">
                    <div className="inline-block bg-primary/10 text-primary font-semibold text-sm px-3 py-1 rounded-full mb-4">
                      {testimonial.result}
                    </div>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                      "{formatQuote(testimonial.quote, testimonial.highlight)}"
                    </p>
                    <p className="font-bold text-lg">{testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel indicators */}
            <div className="flex items-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
