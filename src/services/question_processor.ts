import { AIClient, ChatMessage } from '../ai/client.ts';

export async function processQuestion(question: string, aiClient: AIClient): Promise<number> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that answers questions with numbers only. If the answer is not a number, convert it to a number that makes sense in the context.',
    },
    {
      role: 'user',
      content: question,
    },
  ];

  const response = await aiClient.chat(messages);

  // Extract number from response
  const number = parseInt(response.replace(/\D/g, ''));

  if (isNaN(number)) {
    throw new Error('Could not extract a valid number from AI response');
  }

  return number;
}
