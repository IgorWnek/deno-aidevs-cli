import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { initializeRobotVerification } from './trick-robot-verification.ts';
import { AiClient, type ChatMessage } from '../../ai/client.ts';
import { mockConfig } from '../../test/test-utils.ts';

// Create a mock AIClient class
export const mockAIClient: AiClient = {
  chat: (_messages: ChatMessage[]) => Promise.resolve('Krakow'),
};

Deno.test('initializeRobotVerification - full verification flow', async () => {
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

      // First response (initial verification)
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

      // Second response (AI answer verification)
      return Promise.resolve(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    };

    await initializeRobotVerification(mockConfig, mockAIClient);

    // Verify initial request
    const initialRequest = JSON.parse(requests[0].body as string);
    assertEquals(initialRequest, {
      msgID: '0',
      text: 'READY',
    });

    // Verify AI response request
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
