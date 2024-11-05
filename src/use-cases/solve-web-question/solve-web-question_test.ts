import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { extractQuestion, fetchWebPage, runSolveWebQuestion, submitLoginForm } from './solve-web-question.ts';

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
  // Mock environment variables
  const env = {
    'USERNAME': 'testuser',
    'PASSWORD': 'testpass',
    'ANTHROPIC_API_KEY': 'test-key',
    'AI_MODEL': 'test-model',
    'TARGET_COMPANY_URL': 'https://test.com',
  };

  for (const [key, value] of Object.entries(env)) {
    Deno.env.set(key, value);
  }

  // Mock fetch responses
  const mockHtml = '<div id="human-question">Test question</div>';
  const mockSubmitResponse = 'Success';

  let fetchCount = 0;
  globalThis.fetch = () => {
    fetchCount++;
    // First fetch is for getting the question
    if (fetchCount === 1) {
      return Promise.resolve(new Response(mockHtml));
    }
    // Second fetch is for submitting the answer
    return Promise.resolve(new Response(mockSubmitResponse));
  };

  // Mock process question function
  const mockAnswer = 42;
  const mockProcessQuestion = () => Promise.resolve(mockAnswer);

  try {
    await runSolveWebQuestion(mockProcessQuestion);
    assertEquals(fetchCount, 2); // Verify both fetches were made
  } finally {
    // Clean up
    for (const key of Object.keys(env)) {
      Deno.env.delete(key);
    }
  }
});
