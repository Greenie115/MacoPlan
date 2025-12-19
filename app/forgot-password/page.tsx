'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { sendPasswordResetEmail } from '@/app/actions/password-reset'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await sendPasswordResetEmail(email)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Check your email
            </h2>
            <p className="text-muted-foreground mb-6">
              If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again with a different email address.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
                className="w-full py-3 px-4 border border-border-strong rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Try another email
              </button>
              <Link
                href="/login"
                className="block w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors text-center"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card py-8 px-6 shadow-sm sm:rounded-2xl border border-border-strong">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-input rounded-xl shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card"
                />
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
