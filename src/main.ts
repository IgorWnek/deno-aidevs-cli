import { loadEnvConfig } from './config/env.ts';
import { runSolveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';
import { initializeRobotVerification } from './use-cases/trick-robot-verification/trick-robot-verification.ts';

type UseCase = (args: string[]) => Promise<void>;

const useCases: Record<string, UseCase> = {
  'solve-web-question': async (_args: string[]) => {
    await runSolveWebQuestion();
  },
  'trick-robot': async (_args: string[]) => {
    await initializeRobotVerification();
  },
};

export async function main() {
  try {
    const [useCase, ...args] = Deno.args;

    if (!useCase) {
      console.error('Please specify a use case. Available use cases:');
      console.error(Object.keys(useCases).join('\n'));
      Deno.exit(1);
    }

    const selectedUseCase = useCases[useCase];
    if (!selectedUseCase) {
      console.error(`Unknown use case: ${useCase}`);
      console.error('Available use cases:');
      console.error(Object.keys(useCases).join('\n'));
      Deno.exit(1);
    }

    await loadEnvConfig();
    await selectedUseCase(args);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error:', String(error));
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
