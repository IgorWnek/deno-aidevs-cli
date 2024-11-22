import { mockEnvVars } from './../test/test-utils.ts';
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
    Deno.env.get = (key: string) => mockEnvVars[key as keyof typeof mockEnvVars];

    const config = await loadEnvConfig();
    assertEquals(config, {
      targetCompanyUrl: mockEnvVars.TARGET_COMPANY_URL,
      username: mockEnvVars.USERNAME,
      password: mockEnvVars.PASSWORD,
      anthropicApiKey: mockEnvVars.ANTHROPIC_API_KEY,
      aiModel: mockEnvVars.AI_MODEL,
      targetCompanyVerificationEndpoint: mockEnvVars.TARGET_COMPANY_VERIFICATION_ENDPOINT,
      calibrationFileUrl: mockEnvVars.CALIBRATION_FILE_URL,
      aiDevsApiKey: mockEnvVars.AI_DEVS_API_KEY,
      aiDevsVerificationUrl: mockEnvVars.AI_DEVS_VERIFICATION_URL,
      censorshipTaskUrl: mockEnvVars.CENSORSHIP_TASK_URL,
      auditionsTaskMp3sUrl: mockEnvVars.AUDITIONS_TASK_MP3S_URL,
      auditionsTaskName: mockEnvVars.AUDITIONS_TASK_NAME,
      openAiApiKey: mockEnvVars.OPENAI_API_KEY,
      openAiAudioModel: mockEnvVars.OPENAI_AUDIO_MODEL,
      dalle3ApiKey: mockEnvVars.DALLE3_API_KEY,
      robotImageTaskUrl: mockEnvVars.ROBOT_IMAGE_TASK_URL,
      robotImageTaskName: mockEnvVars.ROBOT_IMAGE_TASK_NAME,
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
