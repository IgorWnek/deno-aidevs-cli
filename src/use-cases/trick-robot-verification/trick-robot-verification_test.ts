import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { initializeRobotVerification } from './trick-robot-verification.ts';
import type { EnvConfig } from '../../config/env.ts';
import { AIClient, type ChatMessage } from '../../ai/client.ts';

const mockConfig: EnvConfig = {
  targetCompanyUrl: 'https://example.com',
  username: 'test-user',
  password: 'test-pass',
  anthropicApiKey: 'test-key',
  aiModel: 'test-model',
  targetCompanyVerificationEndpoint: 'https://example.com/verify',
};

// Create a mock AIClient class
class MockAIClient extends AIClient {
  constructor() {
    super({ apiKey: 'test-key', model: 'test-model' });
  }

  override async chat(_messages: ChatMessage[]): Promise<string> {
    return 'Krakow';
  }
}

Deno.test('initializeRobotVerification - full verification flow', async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  const requests: RequestInit[] = [];
  let capturedOutput = '';

  try {
    console.log = (...args: unknown[]) => {
      capturedOutput += args.join(' ') + '\n';
    };

    globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
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

    const mockAIClient = new MockAIClient();
    const mockConfigLoader = () => Promise.resolve(mockConfig);
    await initializeRobotVerification(mockConfigLoader, mockAIClient);

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
