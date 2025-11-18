import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isSidebarOpen: true, // Open by default on desktop
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: 'navigation-storage', // localStorage key
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name)
            return str ? JSON.parse(str) : null
          } catch (error) {
            // Silently fail during SSR
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            // Silently fail during SSR or if localStorage is full
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch (error) {
            // Silently fail during SSR
          }
        },
      },
    }
  )
)
