'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab?: 'home' | 'recipes' | 'plans' | 'profile'
}

const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'recipes' as const, label: 'Recipes', icon: BookOpen, path: '/recipes' },
  { id: 'plans' as const, label: 'Plans', icon: Calendar, path: '/meal-plans' },
  { id: 'profile' as const, label: 'Profile', icon: User, path: '/profile' },
]

export function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine active tab from pathname if not explicitly provided
  const getActiveTab = () => {
    if (pathname.startsWith('/recipes')) return 'recipes'
    if (pathname.startsWith('/meal-plans')) return 'plans'
    if (pathname.startsWith('/profile')) return 'profile'
    return activeTab
  }

  const currentTab = getActiveTab()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border-strong lg:hidden safe-area-bottom">
      <div className="grid grid-cols-4 h-full max-w-lg mx-auto font-medium">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 transition-colors',
                isActive ? 'text-primary' : 'text-icon hover:text-foreground'
              )}
              aria-label={`Navigate to ${tab.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn('size-6', isActive && 'stroke-[2.5px]')}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span
                className={cn(
                  'text-xs mt-0.5',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
