import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { main, UseCaseError } from './main.ts';

async function withArgs<T>(args: string[], fn: () => Promise<T>): Promise<T> {
  const originalArgs = Deno.args;
  try {
    Object.defineProperty(Deno, 'args', {
      value: args,
      configurable: true,
    });
    return await fn();
  } finally {
    Object.defineProperty(Deno, 'args', {
      value: originalArgs,
      configurable: true,
    });
  }
}

Deno.test('main - no use case specified', async () => {
  await withArgs([], async () => {
    const error = await assertRejects(
      () => main(),
      UseCaseError,
      'Please specify a use case',
    );
    assertEquals(error instanceof UseCaseError, true);
  });
});

Deno.test('main - invalid use case', async () => {
  await withArgs(['invalid-use-case'], async () => {
    const error = await assertRejects(
      () => main(),
      UseCaseError,
      'Unknown use case: invalid-use-case',
    );
    assertEquals(error instanceof UseCaseError, true);
  });
});
