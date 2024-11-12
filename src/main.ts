import { loadEnvConfig } from './config/env.ts';
import { initializeRobotVerification } from './use-cases/trick-robot-verification/trick-robot-verification.ts';
import { AnthropicAiClient } from './ai/client.ts';
import { solveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';
import { calibrationFileFix } from './use-cases/calibration-file-fix/calibration-file-fix.ts';
import { FileService } from './services/file-service.ts';
import { CalculateResultService } from './use-cases/calibration-file-fix/services/calculate-result-service.ts';

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
  const aiClient = new AnthropicAiClient({
    apiKey: config.anthropicApiKey,
    model: config.aiModel,
  });

  const useCases = {
    'trick-robot-verification': (_args: string[]) => initializeRobotVerification(config, aiClient),
    'solve-web-question': (_args: string[]) => solveWebQuestion(config, aiClient),
    'calibration-file-fix': (_args: string[]) => calibrationFileFix(config, aiClient, new FileService(), new CalculateResultService()),
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
