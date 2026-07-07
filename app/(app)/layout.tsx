import { AppShell } from '@/components/layout/app-shell'
import { createClient, getAuthUser } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getAuthUser()

  let userName = 'User'
  let avatarUrl: string | null = null

  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single()

    userName = profile?.full_name || user.email?.split('@')[0] || 'User'
    avatarUrl = profile?.avatar_url ?? null
  }

  return (
    <AppShell userName={userName} avatarUrl={avatarUrl}>
      {children}
    </AppShell>
  )
}
