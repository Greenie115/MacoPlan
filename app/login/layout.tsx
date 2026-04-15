import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Macro Plan account to access your personalized meal plans and macro tracking.',
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
