'use server'

import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().max(100),
})

export async function subscribeToNewsletter(email: string, source: string) {
  const parsed = schema.safeParse({ email, source })
  if (!parsed.success) return { error: 'Please enter a valid email.' }

  const { error } = await createServiceRoleClient()
    .from('newsletter_subscribers')
    .upsert(parsed.data, { onConflict: 'email', ignoreDuplicates: true })

  if (error) return { error: 'Something went wrong. Please try again.' }
  return { success: true }
}
