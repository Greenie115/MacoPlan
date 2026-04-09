import { describe, it, expect, afterEach, vi } from 'vitest'

describe('AnthropicService', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey
  })

  it('lazy-initialises client only on first use', async () => {
    vi.resetModules()
    delete process.env.ANTHROPIC_API_KEY

    const { AnthropicService } = await import('@/lib/services/anthropic')
    const service = new AnthropicService()

    expect(service).toBeDefined()

    process.env.ANTHROPIC_API_KEY = ''
    await expect(
      service.generate({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'hi' }],
      })
    ).rejects.toThrow('ANTHROPIC_API_KEY environment variable is required')
  })

  it('exports a singleton instance', async () => {
    vi.resetModules()
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const { anthropicService } = await import('@/lib/services/anthropic')
    expect(anthropicService).toBeDefined()
  })
})
