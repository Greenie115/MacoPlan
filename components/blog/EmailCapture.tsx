'use client'

import { useState } from 'react'

export function EmailCapture() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <section className="bg-muted/50 py-16">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-border-strong bg-card p-8 text-center shadow-md md:p-12">
          <h2 className="text-2xl font-bold text-foreground [font-family:var(--font-display)] md:text-3xl">
            Get weekly macro tips &amp; recipes
          </h2>
          <p className="mb-8 mt-4 text-lg text-subtle-foreground">
            Join thousands of subscribers getting expert nutrition advice delivered to their inbox.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <label htmlFor="capture-email" className="sr-only">
              Email address
            </label>
            <input
              id="capture-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow rounded-xl border border-border-strong bg-background px-5 py-3.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-coral transition-all duration-base ease-out-quint hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
