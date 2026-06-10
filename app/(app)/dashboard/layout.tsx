import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your MacroPlan dashboard — track macros, view meal plans, and monitor your nutrition progress.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
