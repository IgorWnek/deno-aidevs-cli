import { assertEquals } from 'https://deno.land/std/assert/mod.ts';
import { isValidUseCase, useCases } from './main.ts';

Deno.test('isValidUseCase', async (t) => {
  await t.step('should return true for valid use case', () => {
    assertEquals(isValidUseCase('solve-web-question'), true);
  });

  await t.step('should return false for invalid use case', () => {
    assertEquals(isValidUseCase('invalid-use-case'), false);
  });
});

Deno.test('useCases', async (t) => {
  await t.step('should have solve-web-question use case', () => {
    assertEquals(typeof useCases['solve-web-question'], 'function');
  });
});
