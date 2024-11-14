import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { loadEnvConfig } from './env.ts';

const originalEnv = Deno.env.get;

Deno.test({
  name: 'loadEnvConfig throws error when environment variables are missing',
  fn: async () => {
    // Mock empty environment
    Deno.env.get = () => undefined;

    await assertRejects(
      () => loadEnvConfig(),
      Error,
      'Missing required environment variables',
    );
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: 'loadEnvConfig returns config object when all variables are set',
  fn: async () => {
    const mockEnv = {
      TARGET_COMPANY_URL: 'http://example.com',
      USERNAME: 'test',
      PASSWORD: 'test123',
      ANTHROPIC_API_KEY: 'test-key',
      AI_MODEL: 'claude-3',
      TARGET_COMPANY_VERIFICATION_ENDPOINT: 'https://your-verification-url.com/verification-endpoint',
      CALIBRATION_FILE_URL: 'https://example.com/calibration.json',
      AI_DEVS_API_KEY: 'test-key',
      AI_DEVS_VERIFICATION_URL: 'https://verification-url.com',
      CENSORSHIP_TASK_URL: 'https://censorship-url.com',
    };

    // Mock environment getter
    Deno.env.get = (key: string) => mockEnv[key as keyof typeof mockEnv];

    const config = await loadEnvConfig();
    assertEquals(config, {
      targetCompanyUrl: mockEnv.TARGET_COMPANY_URL,
      username: mockEnv.USERNAME,
      password: mockEnv.PASSWORD,
      anthropicApiKey: mockEnv.ANTHROPIC_API_KEY,
      aiModel: mockEnv.AI_MODEL,
      targetCompanyVerificationEndpoint: mockEnv.TARGET_COMPANY_VERIFICATION_ENDPOINT,
      calibrationFileUrl: mockEnv.CALIBRATION_FILE_URL,
      aiDevsApiKey: mockEnv.AI_DEVS_API_KEY,
      aiDevsVerificationUrl: mockEnv.AI_DEVS_VERIFICATION_URL,
      censorshipTaskUrl: mockEnv.CENSORSHIP_TASK_URL,
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// Restore original env.get after all tests
Deno.test({
  name: 'cleanup',
  fn: () => {
    Deno.env.get = originalEnv;
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
