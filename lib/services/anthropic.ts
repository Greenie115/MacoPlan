import Anthropic from '@anthropic-ai/sdk'

export class AnthropicService {
  private _client: Anthropic | null = null

  private get client(): Anthropic {
    if (!this._client) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required')
      }
      this._client = new Anthropic({ apiKey })
    }
    return this._client
  }

  async generate(params: Anthropic.MessageCreateParams): Promise<Anthropic.Message> {
    return this.client.messages.create(params) as Promise<Anthropic.Message>
  }
}

export const anthropicService = new AnthropicService()
