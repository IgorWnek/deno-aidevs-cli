import { runSolveWebQuestion } from './use-cases/solve-web-question/solve-web-question.ts';

type UseCaseFunction = () => Promise<void>;

export const useCases: Record<string, UseCaseFunction> = {
  'solve-web-question': runSolveWebQuestion,
} as const;

type UseCase = keyof typeof useCases;

export function isValidUseCase(useCase: string): useCase is UseCase {
  return useCase in useCases;
}

function printUsage() {
  console.error('Usage: deno run --allow-net --allow-env --allow-read main.ts <use-case>');
  console.error('\nAvailable use cases:');
  console.error('  solve-web-question  - Solve question from web page');
}

async function main() {
  const [useCase] = Deno.args;

  if (!useCase) {
    console.error('Please provide a use case');
    printUsage();
    Deno.exit(1);
  }

  if (!isValidUseCase(useCase)) {
    console.error(`Invalid use case: ${useCase}`);
    printUsage();
    Deno.exit(1);
  }

  try {
    await useCases[useCase]();
  } catch (error) {
    console.error('Operation failed:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
