import { EnvConfig } from '../../config/env.ts';
import { AiClient, ChatMessage } from '../../ai/client.ts';
import { FileService } from '../../services/file-service.ts';
import { CalculateResultService } from './services/calculate-result-service.ts';

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

interface VerificationApiResponse {
  code: number;
  message: string;
}

const CALIBRATION_FILENAME = 'calibration.json';

export async function calibrationFileFix(
  config: EnvConfig,
  aiClient: AiClient,
  fileService: FileService,
  calculateResult: CalculateResultService
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
  const fixedTestData: TestData[] = [];


  for (const testDataSet of calibrationData['test-data']) {
    const result = calculateResult.evaluateExpression(testDataSet.question);
    let testCaseToSolve: TestCase | null = null;

    if (testDataSet?.test) {
      const question = testDataSet.test.q;
      const systemMessage = `
You are a question solver. You are given a question and you try to answer it correctly with as few words as possible.
You never explain your answer, you just give the answer.
Example:

Question: What is the capital of Germany?
Answer: Berlin

Question: What color is the sky?
Answer: Blue
      `
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: question },
      ];
      console.log(`Test question: ${question}`);
      const aiAnswer = await aiClient.chat(messages);
      testCaseToSolve = {
        q: question,
        a: aiAnswer,
      };
      console.log(`Test answer: ${aiAnswer}`);
    }

    const fixedDataSet: TestData = {
      question: testDataSet.question,
      answer: result,
    }

    if (testCaseToSolve) {
      fixedDataSet.test = testCaseToSolve;
    }

    fixedTestData.push(fixedDataSet);
    count++;
  }

  calibrationData['test-data'] = fixedTestData;
  calibrationData.apikey = config.aiDevsApiKey;

  const response = await fetch(config.aiDevsVerificationUrl, {
    method: 'POST',
    body: JSON.stringify({
      task: 'JSON',
      apikey: config.aiDevsApiKey,
      answer: calibrationData,
    }),
  })

  const result = await response.json() as VerificationApiResponse;

  console.log(`Number of test cases: ${count}`);
  console.log(`Verification result: \ncode: ${result.code}\nmessage: ${result.message}`);
}
