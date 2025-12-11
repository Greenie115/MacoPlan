'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/types/database'

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  userName: string
  avatarUrl: string | null
}

/**
 * Hook to fetch and manage user profile data
 * Returns profile data, loading state, and derived values like userName and avatarUrl
 */
export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }

        setProfile(profileData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Derive user name from profile or email
  const userName = profile?.full_name || 'User'

  // Get avatar URL from profile
  const avatarUrl = profile?.avatar_url || null

  return {
    profile,
    loading,
    error,
    userName,
    avatarUrl,
  }
}
