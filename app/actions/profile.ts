'use server'

import { createClient } from '@/lib/supabase/server'
import { UserProfile, UserProfileInsert, UserProfileUpdate } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { calculateBMR } from '@/lib/calculations/bmr'
import { calculateTDEE, type ActivityLevel } from '@/lib/calculations/tdee'
import { calculateMacros, calculateTargetCalories, type Goal } from '@/lib/calculations/macros'

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

    // Upsert profile (insert or update if exists)
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        { ...data, user_id: user.id },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      )

    if (error) {
      console.error('Error creating profile:', error)
      return { error: 'Failed to create profile. Please try again.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
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
      return { error: 'Failed to update profile. Please try again.' }
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
      return { error: 'Failed to delete profile. Please try again.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error deleting profile:', err)
    return { error: 'Failed to delete profile' }
  }
}

/**
 * Update a single profile field (for auto-save functionality)
 */
export async function updateProfileField<K extends keyof UserProfileUpdate>(
  field: K,
  value: UserProfileUpdate[K]
) {
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
      .update({ [field]: value })
      .eq('user_id', user.id)

    if (error) {
      console.error(`Error updating ${String(field)}:`, error)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
    return { success: true }
  } catch (err) {
    console.error(`Unexpected error updating ${String(field)}:`, err)
    return { error: 'Failed to update profile' }
  }
}

/**
 * Upload avatar to Supabase Storage and update profile
 */
export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    const file = formData.get('avatar') as File
    if (!file) {
      return { error: 'No file provided' }
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size must be less than 5MB' }
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { error: 'File must be JPEG, PNG, or WebP' }
    }

    // Get file extension
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { error: 'Failed to upload avatar' }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile with avatar URL:', updateError)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
    return { success: true, url: publicUrl }
  } catch (err) {
    console.error('Unexpected error uploading avatar:', err)
    return { error: 'Failed to upload avatar' }
  }
}

/**
 * Delete avatar from Supabase Storage and update profile
 */
export async function deleteAvatar() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    // Get current profile to find avatar path
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single()

    if (profile?.avatar_url) {
      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user.id}/${fileName}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage.from('avatars').remove([filePath])

      if (deleteError) {
        console.error('Error deleting avatar from storage:', deleteError)
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile to remove avatar:', updateError)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error deleting avatar:', err)
    return { error: 'Failed to delete avatar' }
  }
}

/**
 * Update user email (sends confirmation email via Supabase Auth)
 */
export async function updateEmail(newEmail: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return { error: 'Invalid email address' }
    }

    // Update email via Supabase Auth (sends confirmation email)
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      console.error('Error updating email:', error)
      return { error: 'Failed to update email. Please try again.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
    return {
      success: true,
      message: 'Confirmation email sent. Please check your inbox.',
    }
  } catch (err) {
    console.error('Unexpected error updating email:', err)
    return { error: 'Failed to update email' }
  }
}

/**
 * Recalculate macros based on current profile data
 */
export async function recalculateMacros() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Profile not found' }
    }

    // Validate required fields
    if (
      !profile.weight_kg ||
      !profile.height_cm ||
      !profile.age ||
      !profile.sex ||
      !profile.activity_level ||
      !profile.goal
    ) {
      return { error: 'Missing required profile data for macro calculation' }
    }

    // Calculate BMR
    const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.sex, 'metric')

    // Calculate TDEE
    const tdee = calculateTDEE(bmr, profile.activity_level as ActivityLevel)

    // Calculate target calories
    const targetCalories = calculateTargetCalories(tdee, profile.goal as Goal)

    // Calculate macros
    const macros = calculateMacros(
      targetCalories,
      profile.goal as Goal,
      profile.weight_kg,
      'kg',
      profile.activity_level as ActivityLevel
    )

    // Update profile with new calculations
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        bmr: Math.round(bmr),
        tdee,
        target_calories: targetCalories,
        protein_grams: macros.protein,
        carb_grams: macros.carbs,
        fat_grams: macros.fat,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating macros:', updateError)
      return { error: 'Failed to update macros' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/profile/editprofile')
    return {
      success: true,
      macros: {
        bmr: Math.round(bmr),
        tdee,
        targetCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      },
    }
  } catch (err) {
    console.error('Unexpected error recalculating macros:', err)
    return { error: 'Failed to recalculate macros' }
  }
}

/**
 * Update the simulated tier for test users
 * Only test users can use this action
 */
export async function updateSimulatedTier(
  tier: 'free' | 'paid' | null
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is a test user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_test_user')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Profile not found' }
    }

    if (!profile.is_test_user) {
      console.warn(
        `[SimulatedTier] Non-test user ${user.id} attempted to set simulated tier`
      )
      return { error: 'This feature is only available for test users' }
    }

    // Update simulated tier
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ simulated_tier: tier })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating simulated tier:', updateError)
      return { error: 'Failed to update simulated tier' }
    }

    console.log(`[SimulatedTier] User ${user.id} set simulated tier to: ${tier}`)

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/plans')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error updating simulated tier:', err)
    return { error: 'Failed to update simulated tier' }
  }
}
