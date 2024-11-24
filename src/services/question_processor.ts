import { AnthropicClient, ChatMessage } from '../ai-clients/anthropic-ai-chat-client.ts';

export async function processQuestion(question: string, aiClient: AnthropicClient): Promise<number> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: question,
    },
  ];
  const systemPrompt =
    'You are a helpful assistant that answers questions with numbers only. If the answer is not a number, convert it to a number that makes sense in the context.';

  const response = await aiClient.chat({
    systemPrompt,
    messages,
    options: {
      model: 'claude-3-5-sonnet-20241022',
    },
  });

  // Extract number from response
  const number = parseInt(response.replace(/\D/g, ''));

  if (isNaN(number)) {
    throw new Error('Could not extract a valid number from AI response');
  }

  return number;
}
