import { assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts';

// Save original args and env
const originalArgs = [...Deno.args];
const originalEnv = Deno.env.get.bind(Deno.env);

async function mockMainImport(mockArgs: string[]) {
  // Mock Deno.args by replacing the prototype getter
  Object.defineProperty(Deno, 'args', {
    value: mockArgs,
    configurable: true,
  });

  // Import and execute main function
  const { main } = await import('./main.ts');
  return main();
}

Deno.test('main - no use case specified', async () => {
  const originalConsoleError = console.error;
  const originalExit = Deno.exit;
  let exitCode = 0;
  let errorOutput = '';

  try {
    console.error = (message: string) => {
      errorOutput += message + '\n';
    };
    Deno.exit = (code?: number) => {
      exitCode = code ?? 0;
      throw new Error('Exit called');
    };

    await assertRejects(
      () => mockMainImport([]),
      Error,
      'Exit called',
    );

    assertEquals(exitCode, 1);
    assertEquals(
      errorOutput.includes('Please specify a use case'),
      true,
    );
    assertEquals(
      errorOutput.includes('solve-web-question'),
      true,
    );
    assertEquals(
      errorOutput.includes('trick-robot'),
      true,
    );
  } finally {
    console.error = originalConsoleError;
    Deno.exit = originalExit;
  }
});

Deno.test('main - invalid use case', async () => {
  const originalConsoleError = console.error;
  const originalExit = Deno.exit;
  let exitCode = 0;
  let errorOutput = '';

  try {
    console.error = (message: string) => {
      errorOutput += message + '\n';
    };
    Deno.exit = (code?: number) => {
      exitCode = code ?? 0;
      throw new Error('Exit called');
    };

    await assertRejects(
      () => mockMainImport(['invalid-use-case']),
      Error,
      'Exit called',
    );

    assertEquals(exitCode, 1);
    assertEquals(
      errorOutput.includes('Unknown use case: invalid-use-case'),
      true,
    );
    assertEquals(
      errorOutput.includes('solve-web-question'),
      true,
    );
    assertEquals(
      errorOutput.includes('trick-robot'),
      true,
    );
  } finally {
    console.error = originalConsoleError;
    Deno.exit = originalExit;
  }
});

// Cleanup after all tests
Deno.test({
  name: 'cleanup',
  fn() {
    Object.defineProperty(Deno, 'args', {
      value: originalArgs,
      configurable: true,
    });
    Object.defineProperty(Deno.env, 'get', {
      value: originalEnv,
      configurable: true,
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
