import { createClient } from '@/lib/supabase/server'

export async function logUsage(
  userId: string | null,
  endpoint: string,
  usage: { input_tokens: number; output_tokens: number },
  status: 'success' | 'validation_fail' | 'retry' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('anthropic_usage_log').insert({
      user_id: userId,
      endpoint,
      model: 'claude-sonnet-4-6',
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      status,
      error_message: errorMessage ?? null,
    })
  } catch {
    // Logging must never fail the request
  }
}
