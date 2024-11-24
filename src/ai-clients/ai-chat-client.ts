export interface AnthropicChatClient {
  chat(messages: AnthropicChatMessage[]): Promise<string>;
}

export interface ChatOpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenAIImageContent[];
}

export interface AnthropicChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatAnthropicContent[];
}

export interface OpenAIImageContent {
  type: 'image';
  image_url: {
    url: string;
  };
}

export interface ClaudeImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageBlockParam {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export type ChatAnthropicContent = ClaudeImageContent | TextContent;
export type ChatOpenAIContent = OpenAIImageContent | TextContent;
