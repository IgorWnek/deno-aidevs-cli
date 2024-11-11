import { EnvConfig } from '../../config/env.ts';
import { AiClient } from '../../ai/client.ts';
import { FileService } from '../../services/file-service.ts';

export interface TestCase {
  q: string;
  a: string;
}

export interface TestData {
  question: string;
  answer: number;
  test?: TestCase;
}

export interface CalibrationFile {
  apikey: string;
  description: string;
  copyright: string;
  'test-data': TestData[];
}

const CALIBRATION_FILENAME = 'calibration.json';

export async function calibrationFileFix(
  config: EnvConfig,
  _aiClient: AiClient,
  fileService: FileService,
): Promise<void> {
  let calibrationData: CalibrationFile;

  try {
    calibrationData = await fileService.readFile<CalibrationFile>(CALIBRATION_FILENAME);
  } catch {
    const response = await fetch(config.calibrationFileUrl);
    const data = await response.text();
    await fileService.saveFile(CALIBRATION_FILENAME, data);
    calibrationData = JSON.parse(data) as CalibrationFile;
  }

  let count = 0;
  for (const testCase of calibrationData['test-data']) {
    console.log(testCase);
    count++;
  }

  console.log(`Number of test cases: ${count}`);
}
