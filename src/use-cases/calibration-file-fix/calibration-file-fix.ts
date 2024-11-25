import { EnvConfig } from '../../config/env.ts';
import { AnthropicClient, ChatMessage } from '../../ai-clients/anthropic-ai-chat-client.ts';
import { FileService } from '../../services/file-service.ts';
import { CalculateResultService } from './services/calculate-result-service.ts';
import { VerificationApiClient } from '../../clients/verification-api-client.ts';
import { questionSolverPrompt } from '../../prompts/question-solver-prompt.ts';

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
  aiChatClient: AnthropicClient,
  fileService: FileService,
  calculateResult: CalculateResultService,
  verificationClient: VerificationApiClient,
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
      const systemPrompt = questionSolverPrompt;
      const messages: ChatMessage[] = [
        { role: 'user', content: question },
      ];
      console.log(`Test question: ${question}`);
      const aiAnswer = await aiChatClient.chat({
        systemPrompt,
        messages,
        options: {
          model: 'claude-3-5-sonnet-20241022',
        },
      });
      testCaseToSolve = {
        q: question,
        a: aiAnswer,
      };
      console.log(`Test answer: ${aiAnswer}`);
    }

    const fixedDataSet: TestData = {
      question: testDataSet.question,
      answer: result,
    };

    if (testCaseToSolve) {
      fixedDataSet.test = testCaseToSolve;
    }

    fixedTestData.push(fixedDataSet);
    count++;
  }

  calibrationData['test-data'] = fixedTestData;
  calibrationData.apikey = config.aiDevsApiKey;

  const result = await verificationClient.verify('JSON', calibrationData);

  console.log(`Number of test cases: ${count}`);
  console.log(`Verification result: \ncode: ${result.code}\nmessage: ${result.message}`);
}
