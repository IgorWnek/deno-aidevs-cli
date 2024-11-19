export interface AiChatClient {
  chat(messages: ChatMessage[]): Promise<string>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
