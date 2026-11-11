import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { UserAvatar } from './user-avatar'

/** Mobile-only bar: on desktop the sidebar carries the logo and the profile. */
export function TopAppBar({ userName, avatarUrl }: { userName: string; avatarUrl: string | null }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-strong bg-background/90 px-4 backdrop-blur-md lg:hidden">
      <Logo href="/dashboard" markSize={24} textClassName="font-display text-lg font-bold tracking-tight" />
      <Link href="/profile" aria-label="Your profile">
        <UserAvatar name={userName} avatarUrl={avatarUrl} />
      </Link>
    </div>
  )
}
