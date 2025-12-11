'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'

const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'recipes' as const, label: 'Recipes', icon: BookOpen, path: '/recipes' },
  { id: 'plans' as const, label: 'Plans', icon: Calendar, path: '/meal-plans' },
  { id: 'profile' as const, label: 'Profile', icon: User, path: '/profile' },
]

export function SidebarNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebarStore()

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.startsWith('/recipes')) return 'recipes'
    if (pathname.startsWith('/meal-plans')) return 'plans'
    if (pathname.startsWith('/profile')) return 'profile'
    return 'home'
  }

  const currentTab = getActiveTab()

  return (
    <>
      {/* Sidebar - always visible on desktop, hidden on mobile */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full bg-card border-r border-border-strong transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          // Hide on mobile, always show on desktop
          'hidden lg:block'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Toggle Button */}
          <button
            onClick={toggle}
            className="absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-card shadow-md hover:bg-accent transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-icon" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-icon" />
            )}
          </button>

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
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                        'transition-colors duration-200',
                        'hover:bg-accent',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-icon hover:text-foreground',
                        isCollapsed && 'justify-center px-2'
                      )}
                      aria-label={`Navigate to ${tab.label}`}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? tab.label : undefined}
                    >
                      <Icon className="size-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
                          {tab.label}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border-strong">
            {!isCollapsed ? (
              <p className="text-xs text-muted-foreground text-center whitespace-nowrap">
                MacroPlan v1.0
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center">v1.0</p>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
