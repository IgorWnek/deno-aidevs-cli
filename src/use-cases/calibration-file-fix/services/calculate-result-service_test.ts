import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { CalculateResultService } from './calculate-result-service.ts';

const service = new CalculateResultService();

Deno.test('CalculateResultService - basic arithmetic operations', () => {
  const testCases = [
    { input: '1 + 1', expected: 2 },
    { input: '5 - 3', expected: 2 },
    { input: '4 * 2', expected: 8 },
    { input: '10 / 2', expected: 5 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - operator precedence', () => {
  const testCases = [
    { input: '2 + 3 * 4', expected: 14 },
    { input: '10 - 2 * 3', expected: 4 },
    { input: '20 / 4 * 2', expected: 10 },
    { input: '2 * 3 + 4 * 5', expected: 26 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - decimal numbers', () => {
  const testCases = [
    { input: '1.5 + 2.5', expected: 4 },
    { input: '3.3 * 2', expected: 6.6 },
    { input: '10.5 / 2', expected: 5.25 },
    { input: '5.5 - 2.2', expected: 3.3 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - negative numbers', () => {
  const testCases = [
    { input: '-1 + 5', expected: 4 },
    { input: '3 * -2', expected: -6 },
    { input: '-10 / 2', expected: -5 },
    { input: '5 - -3', expected: 8 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - multiple operations', () => {
  const testCases = [
    { input: '1 + 2 * 3 - 4 / 2', expected: 5 },
    { input: '10 / 2 * 3 + 4 - 1', expected: 18 },
    { input: '2 * 3 + 4 * 5 - 6 / 2', expected: 23 },
    { input: '1.5 * 2 + 3 * 4 - 5 / 2.5', expected: 13 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - extra whitespace', () => {
  const testCases = [
    { input: '  1   +   2  ', expected: 3 },
    { input: '3*    4', expected: 12 },
    { input: '10/  2', expected: 5 },
  ];

  testCases.forEach(({ input, expected }) => {
    assertEquals(service.evaluateExpression(input), expected);
  });
});

Deno.test('CalculateResultService - invalid expressions', () => {
  const invalidExpressions = [
    '',
    '1 + ',
    '* 2',
    '1 ++ 2',
    '1 + a',
    '1 / 0',
  ];

  invalidExpressions.forEach((expression) => {
    assertThrows(() => service.evaluateExpression(expression));
  });
});
