'use server'

import { createClient } from '@/lib/supabase/server'
import { UserProfile, UserProfileInsert, UserProfileUpdate } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

/**
 * Create a new user profile
 */
export async function createUserProfile(data: Partial<UserProfileInsert>) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    // Insert profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({ ...data, user_id: user.id })

    if (error) {
      console.error('Error creating profile:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error creating profile:', err)
    return { error: 'Failed to create profile' }
  }
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching profile:', err)
    return null
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: UserProfileUpdate) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error updating profile:', err)
    return { error: 'Failed to update profile' }
  }
}

/**
 * Delete the current user's profile
 */
export async function deleteUserProfile() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting profile:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error deleting profile:', err)
    return { error: 'Failed to delete profile' }
  }
}
