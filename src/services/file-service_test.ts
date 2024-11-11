import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { assertExists } from 'https://deno.land/std@0.224.0/assert/assert_exists.ts';
import { FileService } from './file-service.ts';

Deno.test('FileService', async (t) => {
  const fileService = new FileService();
  const tmpDir = new URL('../../tmp', import.meta.url).pathname;

  await t.step('creates tmp directory if it does not exist', async () => {
    try {
      await Deno.remove(tmpDir, { recursive: true });
    } catch {
      // Directory might not exist, ignore error
    }

    await fileService.ensureTmpDirectory();
    const stat = await Deno.stat(tmpDir);
    assertExists(stat);
    assertEquals(stat.isDirectory, true);
  });

  await t.step('does not throw when tmp directory already exists', async () => {
    await fileService.ensureTmpDirectory();
    const stat = await Deno.stat(tmpDir);
    assertExists(stat);
    assertEquals(stat.isDirectory, true);
  });

  await t.step('downloads and saves file', async () => {
    const mockUrl = 'https://example.com/test.json';
    const filename = 'test.json';
    const mockData = '{"test": "data"}';

    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(
        new Response(mockData, {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    try {
      const filePath = await fileService.downloadAndSaveFile(mockUrl, filename);
      const content = await Deno.readTextFile(filePath);
      assertEquals(content, mockData);
    } finally {
      globalThis.fetch = originalFetch;
      try {
        await Deno.remove(`${tmpDir}/${filename}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  await t.step('handles download errors', async () => {
    const mockUrl = 'https://example.com/error.json';
    const filename = 'error.json';

    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(
        new Response('Not Found', {
          status: 404,
        }),
      );

    try {
      await fileService.downloadAndSaveFile(mockUrl, filename);
      throw new Error('Should have thrown an error');
    } catch (error) {
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
