import { assertRejects } from 'https://deno.land/std@0.224.0/assert/assert_rejects.ts';
import { OpenAiAudioClient } from './openai-audio-client.ts';

Deno.test('OpenAiAudioClient', async (t) => {
  const client = new OpenAiAudioClient({ apiKey: 'test-api-key' });

  await t.step('validates file size', async () => {
    const largeFile = new File(
      [new ArrayBuffer(26 * 1024 * 1024)], // 26MB
      'test.mp3',
      { type: 'audio/mp3' },
    );

    await assertRejects(
      () => client.transcribe(largeFile),
      Error,
      'File size exceeds maximum allowed size',
    );
  });

  await t.step('validates file format', async () => {
    const invalidFile = new File(
      [new ArrayBuffer(1024)],
      'test.txt',
      { type: 'text/plain' },
    );

    await assertRejects(
      () => client.transcribe(invalidFile),
      Error,
      'Unsupported file format',
    );
  });
});
