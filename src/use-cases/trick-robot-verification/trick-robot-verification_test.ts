import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { initializeRobotVerification } from './trick-robot-verification.ts';
import { getMockEnvConfig } from '../../test/test-utils.ts';
import { AnthropicClient, ChatMessage, ChatOptions } from '../../ai-clients/anthropic-ai-chat-client.ts';

Deno.test('initializeRobotVerification - full verification flow', async () => {
  const mockConfig = getMockEnvConfig();
  const mockAIClient: AnthropicClient = {
    chat: (_: {
      systemPrompt: string;
      messages: ChatMessage[];
      options?: ChatOptions;
    }) => Promise.resolve('Krakow'),
  };

  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  const requests: RequestInit[] = [];
  let capturedOutput = '';

  try {
    console.log = (...args: unknown[]) => {
      capturedOutput += args.join(' ') + '\n';
    };

    globalThis.fetch = (_input: string | URL | Request, init?: RequestInit) => {
      requests.push(init!);

      if (requests.length === 1) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              msgID: 123,
              text: 'What is the capital of Poland?',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    };

    await initializeRobotVerification(mockConfig, mockAIClient);

    const initialRequest = JSON.parse(requests[0].body as string);
    assertEquals(initialRequest, {
      msgID: '0',
      text: 'READY',
    });

    const aiRequest = JSON.parse(requests[1].body as string);
    assertEquals(aiRequest, {
      msgID: 123,
      text: 'Krakow',
    });
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
  }
});
