import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { spy } from 'https://deno.land/std@0.224.0/testing/mock.ts';
import { AnthropicClient, ChatMessage, ChatOptions } from '../ai-clients/anthropic-ai-chat-client.ts';
import { processQuestion } from './question_processor.ts';

Deno.test('processQuestion - extracts number from AI response', async () => {
  const mockChat = spy((_: {
    systemPrompt: string;
    messages: ChatMessage[];
    options?: ChatOptions;
  }) => Promise.resolve('The answer is 42'));
  const mockAIClient: AnthropicClient = {
    chat: mockChat,
  };

  const result = await processQuestion('What is 6 * 7?', mockAIClient);

  assertEquals(result, 42);
  assertEquals(mockChat.calls.length, 1);
  assertEquals(mockChat.calls[0].args[0], {
    systemPrompt:
      'You are a helpful assistant that answers questions with numbers only. If the answer is not a number, convert it to a number that makes sense in the context.',
    messages: [{
      role: 'user',
      content: 'What is 6 * 7?',
    }],
    options: {
      model: 'claude-3-5-sonnet-20241022',
    },
  });
});

Deno.test('processQuestion - handles non-numeric response', async () => {
  const mockChat = spy((_: {
    systemPrompt: string;
    messages: ChatMessage[];
    options?: ChatOptions;
  }) => Promise.resolve('The answer is forty-two'));
  const mockAIClient: AnthropicClient = {
    chat: mockChat,
  };

  await processQuestion('What is six times seven?', mockAIClient)
    .then(() => {
      throw new Error('Should have thrown an error');
    })
    .catch((error) => {
      assertEquals(error.message, 'Could not extract a valid number from AI response');
    });
});
