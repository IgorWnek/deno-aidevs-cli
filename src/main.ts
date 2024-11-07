import { loadEnvConfig } from './config/env.ts';
import { initializeRobotVerification } from './use-cases/trick-robot-verification/trick-robot-verification.ts';
import { AIClient } from './ai/client.ts';
import { solveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';

// Create AI client instance
const config = await loadEnvConfig();
const aiClient = new AIClient({
  apiKey: config.anthropicApiKey,
  model: config.aiModel,
});

const useCases: Record<string, (args: string[]) => Promise<void>> = {
  'solve-web-question': async (_args: string[]) => {
    await solveWebQuestion(() => loadEnvConfig());
  },
  'trick-robot-verification': async () => {
    await initializeRobotVerification(() => loadEnvConfig(), aiClient);
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
