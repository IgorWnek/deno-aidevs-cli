import { loadEnvConfig } from './config/env.ts';
import { initializeRobotVerification } from './use-cases/trick-robot-verification/trick-robot-verification.ts';
import { AnthropicAiChatClient } from './ai-clients/anthropic-ai-chat-client.ts';
import { solveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';
import { calibrationFileFix } from './use-cases/calibration-file-fix/calibration-file-fix.ts';
import { FileService } from './services/file-service.ts';
import { CalculateResultService } from './use-cases/calibration-file-fix/services/calculate-result-service.ts';
import { AiDevsVerificationApiClient } from './clients/verification-api-client.ts';
import { censorshipTask } from './use-cases/censorship-task/censorship-task.ts';
import { auditionsTask } from './use-cases/auditions-task/auditions-task.ts';
import { AudioFilesService } from './use-cases/auditions-task/services/audio-files-service.ts';
import {
  createAnthropicChatClientConfig,
  createDalle3ImageClientConfig,
  createOpenAiAudioClientConfig,
} from './config/ai.ts';
import { OpenAiAudioClient } from './ai-clients/openai-audio-client.ts';
import { TxtFilesService } from './use-cases/auditions-task/services/txt-files-service.ts';
import { Dalle3ImageClient } from './ai-clients/dalle3-image-client.ts';
import { robotImage } from './use-cases/robot-image.ts';
import { recogniseCity } from './use-cases/recognise-city.ts';
import { filesFromFactory } from './use-cases/files-from-factory.ts';
import { ZipFilesService } from './services/zip-files-service.ts';

export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UseCaseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function main() {
  const [useCase, ...args] = Deno.args;

  if (!useCase) {
    const error = new UseCaseError('Please specify a use case');
    if (import.meta.main) {
      console.error('Error:', error.message);
      Deno.exit(1);
    }
    throw error;
  }

  const config = await loadEnvConfig();
  const anthropicChatClient = new AnthropicAiChatClient(createAnthropicChatClientConfig(config));
  const openAiAudioClient = new OpenAiAudioClient(createOpenAiAudioClientConfig(config));
  const verificationClient = new AiDevsVerificationApiClient(config);
  const dalle3ImageClient = new Dalle3ImageClient(createDalle3ImageClientConfig(config));
  const zipFilesService = new ZipFilesService();

  const useCases = {
    'trick-robot-verification': (_args: string[]) => initializeRobotVerification(config, anthropicChatClient),
    'solve-web-question': (_args: string[]) => solveWebQuestion(config, anthropicChatClient),
    'calibration-file-fix': (_args: string[]) =>
      calibrationFileFix(
        config,
        anthropicChatClient,
        new FileService(),
        new CalculateResultService(),
        verificationClient,
      ),
    'censorship-task': (_args: string[]) =>
      censorshipTask(
        config,
        anthropicChatClient,
        verificationClient,
      ),
    'auditions-task': (_args: string[]) =>
      auditionsTask({
        config,
        verificationClient,
        audioFilesService: new AudioFilesService(),
        txtFilesService: new TxtFilesService(),
        aiChatClient: anthropicChatClient,
        audioClient: openAiAudioClient,
      }),
    'robot-image': (_args: string[]) =>
      robotImage({
        config,
        verificationClient,
        aiChatClient: anthropicChatClient,
        imageClient: dalle3ImageClient,
      }),
    'recognise-city': (_args: string[]) => recogniseCity({ aiChatClient: anthropicChatClient }),
    'files-from-factory': (_args: string[]) =>
      filesFromFactory({ config, zipFilesService, options: { cleanFiles: true } }),
  } as const;

  const selectedUseCase = useCases[useCase as keyof typeof useCases];
  if (!selectedUseCase) {
    const error = new UseCaseError(`Unknown use case: ${useCase}`);
    if (import.meta.main) {
      console.error('Error:', error.message);
      Deno.exit(1);
    }
    throw error;
  }

  try {
    await selectedUseCase(args);
  } catch (error: unknown) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (import.meta.main) {
      Deno.exit(1);
    }
    throw error;
  }
}

if (import.meta.main) {
  main();
}
