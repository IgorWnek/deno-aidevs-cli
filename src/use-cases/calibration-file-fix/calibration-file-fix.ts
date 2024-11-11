import { EnvConfig } from '../../config/env.ts';
import { AiClient } from '../../ai/client.ts';
import { FileService } from '../../services/file-service.ts';

interface TestCase {
  // Question
  q: string;

  // Answer
  a: string;
}

interface TestData {
  question: string;
  answer: number;
  test?: TestCase;
}

interface CalibrationFile {
  apikey: string;
  description: string;
  copyright: string;
  'test-data': TestData[];
}

export async function calibrationFileFix(
  config: EnvConfig,
  _aiClient: AiClient,
): Promise<void> {
  const fileService = new FileService();

  await fileService.ensureTmpDirectory();
  const filePath = await fileService.downloadAndSaveFile(
    config.calibrationFileUrl,
    'calibration.json',
  );

  const fileContent = await Deno.readTextFile(filePath);
  const calibrationData = JSON.parse(fileContent) as CalibrationFile;

  let count = 0;
  for (const testCase of calibrationData['test-data']) {
    console.log(testCase);
    count++;
  }

  console.log(`Number of test cases: ${count}`);
}
