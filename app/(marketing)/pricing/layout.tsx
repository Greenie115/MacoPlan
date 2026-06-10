import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the MacroPlan subscription that fits your goals. Free and premium plans available with personalized meal planning.',
  openGraph: {
    title: 'MacroPlan Pricing - Plans for Every Goal',
    description: 'Choose the MacroPlan subscription that fits your goals. Free and premium plans available.',
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
