import { assertEquals, assertRejects } from 'https://deno.land/std/assert/mod.ts';
import { extractQuestion, fetchWebPage, submitLoginForm } from './solve-web-question.ts';

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
