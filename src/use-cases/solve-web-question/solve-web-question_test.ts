import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { extractQuestion, fetchWebPage, solveWebQuestion, submitLoginForm } from './solve-web-question.ts';
import type { EnvConfig } from '../../config/env.ts';
import { AIClient } from '../../ai/client.ts';

const mockConfig: EnvConfig = {
  targetCompanyUrl: 'https://example.com',
  username: 'test-user',
  password: 'test-pass',
  anthropicApiKey: 'test-key',
  aiModel: 'test-model',
  targetCompanyVerificationEndpoint: 'https://example.com/verify',
};

Deno.test('fetchWebPage', async (t) => {
  await t.step('should fetch HTML content from a URL', async () => {
    const mockHtml = '<div id="human-question">Test question</div>';
    globalThis.fetch = () => Promise.resolve(new Response(mockHtml));

    const result = await fetchWebPage('https://test.com');
    assertEquals(result, mockHtml);
  });

  await t.step('should throw error on failed fetch', async () => {
    globalThis.fetch = () => Promise.resolve(new Response(null, { status: 404 }));

    await assertRejects(
      () => fetchWebPage('https://test.com'),
      Error,
      'HTTP error! status: 404',
    );
  });
});

Deno.test('extractQuestion', async (t) => {
  await t.step('should extract question from HTML', () => {
    const html = '<div id="human-question">Test question</div>';
    const result = extractQuestion(html);
    assertEquals(result, 'Test question');
  });

  await t.step('should throw error when question element not found', () => {
    const html = '<div>No question here</div>';
    try {
      extractQuestion(html);
      throw new Error('Should have thrown an error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        assertEquals(error.message, 'Question element not found');
      } else {
        throw new Error('Unexpected error type');
      }
    }
  });
});

Deno.test('submitLoginForm', async (t) => {
  await t.step('should submit form successfully', async () => {
    const mockResponse = 'Success';
    globalThis.fetch = () => Promise.resolve(new Response(mockResponse));

    const result = await submitLoginForm('https://test.com', {
      username: 'test',
      password: 'test',
      answer: 42,
    });

    assertEquals(result, mockResponse);
  });

  await t.step('should throw error on failed submission', async () => {
    globalThis.fetch = () => Promise.resolve(new Response(null, { status: 400 }));

    await assertRejects(
      async () =>
        await submitLoginForm('https://test.com', {
          username: 'test',
          password: 'test',
          answer: 42,
        }),
      Error,
      'HTTP error! status: 400',
    );
  });
});

Deno.test('runSolveWebQuestion', async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  let capturedOutput = '';

  try {
    console.log = (...args: unknown[]) => {
      capturedOutput += args.join(' ') + '\n';
    };

    globalThis.fetch = (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve(
          new Response('Success', {
            status: 200,
          }),
        );
      }
      return Promise.resolve(
        new Response(
          '<div id="human-question">What is 2+2?</div>',
          {
            status: 200,
          },
        ),
      );
    };

    const mockConfigLoader = () => Promise.resolve(mockConfig);
    const mockQuestionProcessor = (_question: string, _client: AIClient) => Promise.resolve(4);

    await solveWebQuestion(mockConfigLoader, mockQuestionProcessor);

    assertEquals(
      capturedOutput.includes('Question: What is 2+2?'),
      true,
    );
    assertEquals(
      capturedOutput.includes('AI generated answer: 4'),
      true,
    );
    assertEquals(
      capturedOutput.includes('Response: Success'),
      true,
    );
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
  }
});
