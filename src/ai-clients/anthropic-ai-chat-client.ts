import { Anthropic } from 'npm:@anthropic-ai/sdk';

type MessageRole = 'user' | 'assistant';
type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export type ClaudeModel =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-5-haiku-latest'
  | 'claude-3-opus-20240229'
  | 'claude-3-opus-latest'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: MediaType;
    data: string;
  };
}

export type MessageContent = string | (TextContent | ImageContent)[];

export interface ChatMessage {
  role: MessageRole;
  content: MessageContent;
}

export interface AnthropicConfig {
  apiKey: string;
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: ClaudeModel;
}

export interface AnthropicClient {
  chat(payload: {
    systemPrompt: string;
    messages: ChatMessage[];
    options?: ChatOptions;
  }): Promise<string>;
}

export class AnthropicAiChatClient implements AnthropicClient {
  private client: Anthropic;
  private readonly defaultModel: ClaudeModel = 'claude-3-5-sonnet-20241022';
  private readonly defaultMaxTokens = 1024;
  private readonly defaultTemperature = 1.0;

  constructor(private config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async chat(payload: {
    systemPrompt: string;
    messages: ChatMessage[];
    options?: ChatOptions;
  }): Promise<string> {
    const { systemPrompt, messages, options } = payload;
    const response = await this.client.messages.create({
      model: options?.model ?? this.config.model ?? this.defaultModel,
      max_tokens: options?.maxTokens ?? this.config.maxTokens ?? this.defaultMaxTokens,
      temperature: options?.temperature ?? this.config.temperature ?? this.defaultTemperature,
      system: systemPrompt,
      messages: messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return content.text;
  }
}
