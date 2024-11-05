import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { initializeRobotVerification } from './trick-robot-verification.ts';
import type { EnvConfig } from '../../config/env.ts';

const mockConfig: EnvConfig = {
  targetCompanyUrl: 'https://example.com',
  username: 'test-user',
  password: 'test-pass',
  anthropicApiKey: 'test-key',
  aiModel: 'test-model',
  targetCompanyVerificationEndpoint: 'https://example.com/verify',
};

Deno.test('initializeRobotVerification - successful request', async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleLog = console.log;
  let requestInit: RequestInit | undefined;
  let capturedOutput = '';

  try {
    console.log = (...args: unknown[]) => {
      capturedOutput += args.join(' ') + '\n';
    };

    globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      assertEquals(
        url,
        mockConfig.targetCompanyVerificationEndpoint,
        'Verification URL should match the configured endpoint',
      );
      requestInit = init;
      const responseData = { status: 'ok', message: 'Verification successful' };
      return Promise.resolve(
        new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    };

    const mockConfigLoader = () => Promise.resolve(mockConfig);
    await initializeRobotVerification(mockConfigLoader);

    // Verify request payload
    const requestBody = JSON.parse(requestInit?.body as string);
    assertEquals(requestBody, {
      msgID: '0',
      text: 'READY',
    });

    // Verify request headers
    const headers = new Headers(requestInit?.headers);
    assertEquals(
      headers.get('Content-Type'),
      'application/json',
    );

    // Verify console output contains the response data
    const expectedOutput = 'Verification Response: {"status":"ok","message":"Verification successful"}';
    assertEquals(
      capturedOutput.trim().includes(expectedOutput),
      true,
      `Expected output to contain: ${expectedOutput}\nActual output: ${capturedOutput}`,
    );
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
  }
});

Deno.test('initializeRobotVerification - failed request', async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  let capturedError = '';

  try {
    console.error = (message: string) => {
      capturedError = message;
    };

    globalThis.fetch = (_input: string | URL | Request, _init?: RequestInit) => {
      return Promise.resolve(new Response('Error', { status: 400 }));
    };

    const mockConfigLoader = () => Promise.resolve(mockConfig);
    await assertRejects(
      async () => await initializeRobotVerification(mockConfigLoader),
      Error,
      'HTTP error! status: 400',
    );

    assertEquals(
      capturedError.includes('Robot verification failed'),
      true,
    );
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});
