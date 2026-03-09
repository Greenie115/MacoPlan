import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free MacroPlan account and get personalized meal plans that hit your macros perfectly.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
