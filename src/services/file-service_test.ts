import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { assertExists } from 'https://deno.land/std@0.224.0/assert/assert_exists.ts';
import { FileService } from './file-service.ts';

Deno.test('FileService', async (t) => {
  const testTmpBase = `.test-${crypto.randomUUID()}`;
  const fileService = new FileService(testTmpBase);

  // Cleanup helper function
  const cleanup = async () => {
    try {
      await Deno.remove(testTmpBase, { recursive: true });
    } catch {
      // Directory might not exist, ignore error
    }
  };

  // Setup step - runs first
  await cleanup();

  await t.step('creates tmp directory if it does not exist', async () => {
    const tmpDir = await fileService.ensureTmpDirectory();
    const stat = await Deno.stat(tmpDir);
    assertExists(stat);
    assertEquals(stat.isDirectory, true);
  });

  await t.step('saves and reads file correctly', async () => {
    type TestData = { test: string };
    const filename = 'test.json';
    const testData: TestData = { test: 'data' };

    await fileService.saveFile(filename, JSON.stringify(testData));
    const readData = await fileService.readFile<TestData>(filename);
    
    assertEquals(readData, testData);
  });

  await t.step('throws when reading non-existent file', async () => {
    try {
      await fileService.readFile<unknown>('non-existent.json');
      throw new Error('Should have thrown');
    } catch (error) {
      assertEquals(error instanceof Deno.errors.NotFound, true);
    }
  });

  // Cleanup step - runs last
  await t.step('cleanup', cleanup);
});
