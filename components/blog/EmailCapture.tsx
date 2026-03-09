'use client'

import { useState } from 'react'

export function EmailCapture() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border-strong shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get weekly macro tips & recipes
          </h2>
          <p className="text-subtle-foreground text-lg mb-8">
            Join thousands of subscribers getting expert nutrition advice delivered to their inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow px-5 py-3.5 rounded-xl border border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
