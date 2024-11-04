import { Anthropic } from 'npm:@anthropic-ai/sdk';

export interface AIClientConfig {
  apiKey: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIClient {
  private client: Anthropic;
  private model: string;

  constructor(config: AIClientConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Convert our generic messages format to Anthropic's format
    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 100,
      temperature: 0,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return content.text;
  }
}
