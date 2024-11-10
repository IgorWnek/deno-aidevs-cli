import { loadEnvConfig } from './config/env.ts';
import { initializeRobotVerification } from './use-cases/trick-robot-verification/trick-robot-verification.ts';
import { AIClient } from './ai/client.ts';
import { solveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';
import { calibrationFileFix } from './use-cases/calibration-file-fix/calibration-file-fix.ts';

export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UseCaseError';
  }
}

export async function main() {
  try {
    const config = await loadEnvConfig();
    const aiClient = new AIClient({
      apiKey: config.anthropicApiKey,
      model: config.aiModel,
    });

    const useCases = {
      'trick-robot-verification': (_args: string[]) => initializeRobotVerification(() => loadEnvConfig(), aiClient),
      'solve-web-question': (_args: string[]) => solveWebQuestion(() => loadEnvConfig()),
      'calibration-file-fix': (_args: string[]) => calibrationFileFix(() => loadEnvConfig(), aiClient),
    } as const;

    console.log(`
Available commands:
- trick-robot-verification
- solve-web-question
- calibration-file-fix
`);

    const [useCase, ...args] = Deno.args;

    if (!useCase) {
      const availableCases = Object.keys(useCases).join('\n- ');
      throw new UseCaseError(`Please specify a use case. Available use cases:\n- ${availableCases}`);
    }

    const selectedUseCase = useCases[useCase as keyof typeof useCases];
    if (!selectedUseCase) {
      const availableCases = Object.keys(useCases).join('\n- ');
      throw new UseCaseError(`Unknown use case: ${useCase}\nAvailable use cases:\n- ${availableCases}`);
    }

    await selectedUseCase(args);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      if (import.meta.main) {
        Deno.exit(1);
      }
      throw error;
    } else {
      const errorMessage = String(error);
      console.error('Error:', errorMessage);
      if (import.meta.main) {
        Deno.exit(1);
      }
      throw new Error(errorMessage);
    }
  }
}

if (import.meta.main) {
  main();
}
