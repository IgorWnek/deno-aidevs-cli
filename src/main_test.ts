import { assertEquals } from 'https://deno.land/std/assert/assert_equals.ts';
import { stub } from 'https://deno.land/std/testing/mock.ts';

const TEST_HTML = `
<!DOCTYPE html>
<html>
  <body>
    <p id="human-question">What is 2 + 2?</p>
    <form>
      <input name="username" />
      <input name="password" type="password" />
      <input name="answer" type="number" />
    </form>
  </body>
</html>
`;

Deno.test('fetchWebPage - successful fetch', async () => {
  const fetchStub = stub(globalThis, 'fetch', () => Promise.resolve(new Response(TEST_HTML, { status: 200 })));

  try {
    const { fetchWebPage } = await import('./main.ts');
    const result = await fetchWebPage('https://example.com');
    assertEquals(result, TEST_HTML);
  } finally {
    fetchStub.restore();
  }
});

Deno.test('extractQuestion - successful extraction', async () => {
  const { extractQuestion } = await import('./main.ts');
  const question = extractQuestion(TEST_HTML);
  assertEquals(question, 'What is 2 + 2?');
});

Deno.test('submitLoginForm - successful submission', async () => {
  const expectedResponse = 'Login successful';
  const fetchStub = stub(globalThis, 'fetch', () => Promise.resolve(new Response(expectedResponse, { status: 200 })));

  try {
    const { submitLoginForm } = await import('./main.ts');
    const result = await submitLoginForm('https://example.com', {
      username: 'test',
      password: 'test',
      answer: 42,
    });
    assertEquals(result, expectedResponse);
  } finally {
    fetchStub.restore();
  }
});
