'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import { useEffect } from 'react'

const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'recipes' as const, label: 'Recipes', icon: BookOpen, path: '/recipes' },
  { id: 'plans' as const, label: 'Plans', icon: Calendar, path: '/plans' },
  { id: 'profile' as const, label: 'Profile', icon: User, path: '/profile' },
]

export function SidebarNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { isSidebarOpen, closeSidebar } = useNavigationStore()

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.startsWith('/recipes')) return 'recipes'
    if (pathname.startsWith('/plans')) return 'plans'
    if (pathname.startsWith('/profile')) return 'profile'
    return 'home'
  }

  const currentTab = getActiveTab()

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSidebarOpen, closeSidebar])

  return (
    <>
      {/* Overlay - click to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden lg:block"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - only shown on desktop */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border',
          'transition-transform duration-300 ease-in-out',
          'w-64',
          // Hide on mobile, show on desktop
          'hidden lg:block',
          // Desktop: slide in/out based on state
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Navigation items */}
          <nav className="flex-1 p-4 pt-20">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = currentTab === tab.id

                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        router.push(tab.path)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                        'transition-colors duration-200',
                        'hover:bg-accent',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-muted-foreground'
                      )}
                      aria-label={`Navigate to ${tab.label}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="size-5" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              MacroPlan v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
