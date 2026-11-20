'use client'

import { useState } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    const result = await subscribeToNewsletter(email, 'blog-index')
    if ('error' in result) {
      setStatus('error')
      setMessage(result.error ?? '')
      return
    }
    sendGAEvent('event', 'newsletter_signup', { source: 'blog-index' })
    setStatus('done')
    setEmail('')
  }

  return (
    <section className="bg-muted/50 py-16">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-border-strong bg-card p-8 text-center shadow-md md:p-12">
          <h2 className="text-2xl font-bold text-foreground font-display md:text-3xl">
            Stuck on what to eat this week?
          </h2>
          <p className="mb-8 mt-4 text-lg text-subtle-foreground">
            Get new guides and batch-cook recipes that fix the problems lifters actually hit, straight to your inbox.
          </p>
          {status === 'done' ? (
            <p className="font-semibold text-foreground" role="status">You&apos;re in. Watch your inbox.</p>
          ) : (
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
              disabled={status === 'sending'}
              className="rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-coral transition-all duration-base ease-out-quint hover:-translate-y-0.5 active:scale-[0.97]"
            >
              {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-destructive" role="alert">{message}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
