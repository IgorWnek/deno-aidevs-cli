import { assertSpyCalls, spy } from 'https://deno.land/std@0.224.0/testing/mock.ts';
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { CalibrationFile, calibrationFileFix } from './calibration-file-fix.ts';
import { mockAIClient, mockConfig } from '../../test/test-utils.ts';
import { FileService } from '../../services/file-service.ts';
import { CalculateResultService } from './services/calculate-result-service.ts';
import { VerificationApiClient, VerificationApiResponse } from '../../clients/verification-api-client.ts';

class MockVerificationApiClient implements VerificationApiClient {
  verify<T>(_taskName: string, _answer: T): Promise<VerificationApiResponse> {
    return Promise.resolve({
      code: 0,
      message: 'OK',
    });
  }
}

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

  const mockVerificationClient = new MockVerificationApiClient();
  const verifySpy = spy(mockVerificationClient, 'verify');

  try {
    await calibrationFileFix(
      mockConfig,
      mockAIClient,
      fileService,
      new CalculateResultService(),
      mockVerificationClient,
    );

    assertSpyCalls(verifySpy, 1);
    assertEquals(verifySpy.calls[0].args, [
      'JSON',
      {
        ...mockCalibrationData,
        apikey: mockConfig.aiDevsApiKey,
        'test-data': [
          { question: '2+2', answer: 4 },
          { question: '3+3', answer: 6 },
        ],
      },
    ]);
  } finally {
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

  const mockVerificationClient = new MockVerificationApiClient();
  const verifySpy = spy(mockVerificationClient, 'verify');

  try {
    await calibrationFileFix(
      mockConfig,
      mockAIClient,
      fileService,
      new CalculateResultService(),
      mockVerificationClient,
    );

    assertSpyCalls(verifySpy, 1);
    assertEquals(verifySpy.calls[0].args, [
      'JSON',
      {
        ...mockCalibrationData,
        apikey: mockConfig.aiDevsApiKey,
        'test-data': [
          { question: '2+2', answer: 4 },
          { question: '3+3', answer: 6 },
        ],
      },
    ]);
  } finally {
    fileService.readFile = originalReadFile;
    fileService.saveFile = originalSaveFile;
    globalThis.fetch = originalFetch;
  }
});
