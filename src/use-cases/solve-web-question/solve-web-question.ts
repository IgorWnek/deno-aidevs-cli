import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts';
import { AnthropicChatClient } from '../../ai-clients/ai-chat-client.ts';
import { type EnvConfig } from '../../config/env.ts';
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

export async function solveWebQuestion(
  config: EnvConfig,
  aiChatClient: AnthropicChatClient,
  customProcessQuestion?: (question: string, aiChatClient: AnthropicChatClient) => Promise<number>,
) {
  try {
    const html = await fetchWebPage(config.targetCompanyUrl);
    const question = extractQuestion(html);
    console.log('Question:', question);

    const questionProcessor = customProcessQuestion || processQuestion;
    const answer = await questionProcessor(question, aiChatClient);
    console.log('AI generated answer:', answer);

    const response = await submitLoginForm(config.targetCompanyUrl, {
      username: config.username,
      password: config.password,
      answer,
    });

    console.log('Response:', response);
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}
