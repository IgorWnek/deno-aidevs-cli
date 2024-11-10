import { assertEquals } from 'https://deno.land/std/assert/assert_equals.ts';
import { calibrationFileFix } from './calibration-file-fix.ts';
import { withMockedEnv } from '../../test/test-utils.ts';
import { AIClient } from '../../ai/client.ts';

const mockAIClient = new AIClient({
  apiKey: 'test-key',
  model: 'test-model',
});

Deno.test(
  'calibrationFileFix should print WIP message',
  withMockedEnv(async () => {
    const chunks: string[] = [];
    const originalConsoleLog = console.log;

    try {
      console.log = (msg: string) => {
        chunks.push(msg);
      };

      await calibrationFileFix(
        () => (Promise.resolve({
          username: 'test-user',
          password: 'test-pass',
          anthropicApiKey: 'test-key',
          aiModel: 'test-model',
          targetCompanyUrl: 'http://test.com',
          targetCompanyVerificationEndpoint: 'http://test.com/verify',
        })),
        mockAIClient,
      );

      assertEquals(chunks[0], 'Calibration File Fix - WIP');
    } finally {
      console.log = originalConsoleLog;
    }
  }),
);
