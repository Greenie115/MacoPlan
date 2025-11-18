'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, User, X } from 'lucide-react'
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

  // Close sidebar on mobile when clicking outside or on escape
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
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border',
          'transition-transform duration-300 ease-in-out',
          'w-64 lg:sticky lg:z-30',
          // Mobile: slide in from left
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, no transform
          'lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">MacroPlan</h2>
            {/* Close button - only visible on mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = currentTab === tab.id

                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        router.push(tab.path)
                        // Close sidebar on mobile after navigation
                        if (window.innerWidth < 1024) {
                          closeSidebar()
                        }
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

          {/* Footer - can add user info or settings later */}
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
