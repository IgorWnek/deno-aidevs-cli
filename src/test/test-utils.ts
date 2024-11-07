export const mockEnvVars = {
  TARGET_COMPANY_URL: 'http://example.com',
  USERNAME: 'test-user',
  PASSWORD: 'test-pass',
  ANTHROPIC_API_KEY: 'test-key',
  AI_MODEL: 'claude-3-sonnet',
  TARGET_COMPANY_VERIFICATION_ENDPOINT: 'http://example.com/verify',
};

export function withMockedEnv(fn: () => Promise<void>) {
  return async () => {
    const realEnv = Deno.env;
    // Create mock env object
    const mockEnv = {
      get: (key: string) => mockEnvVars[key as keyof typeof mockEnvVars] || null,
      toObject: () => ({ ...mockEnvVars }),
    };

    // Replace Deno.env with our mock
    Object.defineProperty(Deno, 'env', {
      value: mockEnv,
      configurable: true,
    });

    try {
      await fn();
    } finally {
      // Restore the real Deno.env
      Object.defineProperty(Deno, 'env', {
        value: realEnv,
        configurable: true,
      });
    }
  };
}
