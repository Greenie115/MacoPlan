import { Home, BookOpen, Calendar, User } from 'lucide-react'

/** The four app destinations, shared by the sidebar and the bottom nav. */
export const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Recipes', icon: BookOpen, path: '/recipes' },
  { label: 'Plans', icon: Calendar, path: '/meal-plans' },
  { label: 'Profile', icon: User, path: '/profile' },
] as const

/** Grocery lists hang off plans; everything unmatched is Home. */
export function activePath(pathname: string): string {
  if (pathname.startsWith('/grocery-lists')) return '/meal-plans'
  return NAV_ITEMS.find((item) => pathname.startsWith(item.path))?.path ?? '/dashboard'
}
