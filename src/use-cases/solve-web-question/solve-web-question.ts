import { load } from 'https://deno.land/std/dotenv/mod.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { AIClient, AIClientConfig } from '../../ai/client.ts';
import { processQuestion } from '../../services/question_processor.ts';

interface LoginCredentials {
  username: string;
  password: string;
  answer: number;
}

export async function fetchWebPage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw error;
  }
}

export function extractQuestion(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  if (!document) throw new Error('Failed to parse HTML');

  const questionElement = document.querySelector('#human-question');
  if (!questionElement) throw new Error('Question element not found');

  return questionElement.textContent;
}

export async function submitLoginForm(url: string, credentials: LoginCredentials): Promise<string> {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  formData.append('answer', credentials.answer.toString());

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

async function getCredentials(): Promise<{ username: string; password: string }> {
  await load({ export: true });

  const username = Deno.env.get('USERNAME');
  const password = Deno.env.get('PASSWORD');

  if (!username || !password) {
    throw new Error('USERNAME and PASSWORD environment variables must be set');
  }

  return { username, password };
}

function getAIConfig(): AIClientConfig {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  const model = Deno.env.get('AI_MODEL');

  if (!apiKey || !model) {
    throw new Error('ANTHROPIC_API_KEY and AI_MODEL environment variables must be set');
  }

  return { apiKey, model };
}

export async function runSolveWebQuestion(url: string) {
  try {
    await load({ export: true });

    const html = await fetchWebPage(url);
    const question = extractQuestion(html);
    console.log('Question:', question);

    const aiConfig = getAIConfig();
    const aiClient = new AIClient(aiConfig);
    const answer = await processQuestion(question, aiClient);
    console.log('AI generated answer:', answer);

    const { username, password } = await getCredentials();

    const response = await submitLoginForm(url, {
      username,
      password,
      answer,
    });

    console.log('Response:', response);
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}
