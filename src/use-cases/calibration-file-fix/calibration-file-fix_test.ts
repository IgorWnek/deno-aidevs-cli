import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { calibrationFileFix } from './calibration-file-fix.ts';
import { mockAIClient, mockConfig } from '../../test/test-utils.ts';

Deno.test('calibrationFileFix', async () => {
  // Mock file operations
  const originalReadTextFile = Deno.readTextFile;
  const originalStat = Deno.stat;
  const originalMkdir = Deno.mkdir;
  const originalFetch = globalThis.fetch;

  // Mock calibration file content
  const mockCalibrationData = {
    apikey: 'test-key',
    description: 'test description',
    copyright: 'test copyright',
    'test-data': [
      { question: '2+2', answer: 4 },
      { question: '3+3', answer: 6 },
    ],
  };

  Deno.readTextFile = () => Promise.resolve(JSON.stringify(mockCalibrationData));
  Deno.stat = () => Promise.resolve({} as Deno.FileInfo);
  Deno.mkdir = () => Promise.resolve();
  globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(mockCalibrationData)));

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (msg: string) => logs.push(msg);

  try {
    await calibrationFileFix(mockConfig, mockAIClient);
    assertEquals(logs.length, 3); // 2 test cases + final count
    assertEquals(logs[2], 'Number of test cases: 2');
  } finally {
    // Restore all mocked functions
    console.log = originalLog;
    Deno.readTextFile = originalReadTextFile;
    Deno.stat = originalStat;
    Deno.mkdir = originalMkdir;
    globalThis.fetch = originalFetch;
  }
});
