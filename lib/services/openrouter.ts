/**
 * OpenRouter API client
 *
 * Minimal fetch wrapper for the OpenAI-compatible chat completions endpoint.
 * Used for recipe enrichment (seed script) and batch-prep plan assembly.
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterChoice {
  message: { role: string; content: string }
  finish_reason: string
}

export interface OpenRouterResponse {
  id: string
  choices: OpenRouterChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY environment variable is required')
  return key
}

export async function chatCompletion(
  messages: OpenRouterMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    jsonMode?: boolean
  } = {}
): Promise<OpenRouterResponse> {
  const {
    model = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.7-flash',
    temperature = 0.3,
    maxTokens = 4096,
    jsonMode = false,
  } = options

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  }

  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://macroplan.app',
      'X-Title': 'MacroPlan Recipe Library',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<OpenRouterResponse>
}

export function extractContent(response: OpenRouterResponse): string {
  return response.choices[0]?.message?.content ?? ''
}

export function extractUsage(response: OpenRouterResponse) {
  return response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
}
