import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { CalibrationFile, calibrationFileFix } from './calibration-file-fix.ts';
import { mockAIClient, mockConfig } from '../../test/test-utils.ts';
import { FileService } from '../../services/file-service.ts';

Deno.test('calibrationFileFix - file exists', async () => {
  const mockCalibrationData: CalibrationFile = {
    apikey: 'test-key',
    description: 'test description',
    copyright: 'test copyright',
    'test-data': [
      { question: '2+2', answer: 4 },
      { question: '3+3', answer: 6 },
    ],
  };

  const fileService = new FileService();
  const originalReadFile = fileService.readFile;
  fileService.readFile = <T>() => Promise.resolve(mockCalibrationData as T);

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (msg: string) => logs.push(msg);

  try {
    await calibrationFileFix(mockConfig, mockAIClient, fileService);
    assertEquals(logs.length, 3);
    assertEquals(logs[2], 'Number of test cases: 2');
  } finally {
    console.log = originalLog;
    fileService.readFile = originalReadFile;
  }
});

Deno.test('calibrationFileFix - file needs to be downloaded', async () => {
  const mockCalibrationData: CalibrationFile = {
    apikey: 'test-key',
    description: 'test description',
    copyright: 'test copyright',
    'test-data': [
      { question: '2+2', answer: 4 },
      { question: '3+3', answer: 6 },
    ],
  };

  const fileService = new FileService();
  const originalReadFile = fileService.readFile;
  const originalSaveFile = fileService.saveFile;
  const originalFetch = globalThis.fetch;

  fileService.readFile = <T>() => Promise.reject(new Error('File not found'));
  fileService.saveFile = () => Promise.resolve();
  globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(mockCalibrationData)));

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (msg: string) => logs.push(msg);

  try {
    await calibrationFileFix(mockConfig, mockAIClient, fileService);
    assertEquals(logs.length, 3);
    assertEquals(logs[2], 'Number of test cases: 2');
  } finally {
    console.log = originalLog;
    fileService.readFile = originalReadFile;
    fileService.saveFile = originalSaveFile;
    globalThis.fetch = originalFetch;
  }
});
