import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { assertExists } from 'https://deno.land/std@0.224.0/assert/assert_exists.ts';
import { FileService } from './file-service.ts';

Deno.test('FileService', async (t) => {
  const fileService = new FileService();

  await t.step('ensures tmp directory exists', async () => {
    await fileService.ensureTmpDirectory();
    const stat = await Deno.stat('./tmp');
    assertExists(stat);
    assertEquals(stat.isDirectory, true);
  });

  await t.step('downloads and saves file', async () => {
    const mockUrl = 'https://example.com/test.json';
    const filename = 'test.json';

    // Mock fetch globally
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => {
      return Promise.resolve(
        new Response('{"test": "data"}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    };

    try {
      const filePath = await fileService.downloadAndSaveFile(mockUrl, filename);
      const content = await Deno.readTextFile(filePath);
      assertEquals(content, '{"test": "data"}');
    } finally {
      globalThis.fetch = originalFetch;
      // Cleanup
      try {
        await Deno.remove(`./tmp/${filename}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  await t.step('handles download errors', async () => {
    const mockUrl = 'https://example.com/error.json';
    const filename = 'error.json';

    // Mock fetch globally
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => {
      return Promise.resolve(
        new Response('Not Found', {
          status: 404,
        }),
      );
    };

    try {
      await fileService.downloadAndSaveFile(mockUrl, filename);
      throw new Error('Should have thrown an error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        assertEquals(error.message, 'Failed to download file: Not Found');
      } else {
        throw error;
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
