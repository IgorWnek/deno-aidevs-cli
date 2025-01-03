import { AnthropicClient, ChatMessage, ChatOptions } from '../ai-clients/anthropic-ai-chat-client.ts';
import { EnvConfig } from '../config/env.ts';

export const mockEnvVars = {
  TARGET_COMPANY_URL: 'http://example.com',
  USERNAME: 'test-user',
  PASSWORD: 'test-pass',
  ANTHROPIC_API_KEY: 'test-key',
  AI_MODEL: 'claude-3-sonnet',
  TARGET_COMPANY_VERIFICATION_ENDPOINT: 'http://example.com/verify',
  CALIBRATION_FILE_URL: 'https://example.com/calibration.json',
  AI_DEVS_API_KEY: 'test-key',
  AI_DEVS_VERIFICATION_URL: 'https://test.com/verify',
  FIRECRAWL_API_KEY: 'test-key',
  CENSORSHIP_TASK_URL: 'https://test.com/censorship',
  AUDITIONS_TASK_MP3S_URL: 'https://test.com/auditions',
  AUDITIONS_TASK_NAME: 'auditions',
  OPENAI_API_KEY: 'test-key',
  OPENAI_AUDIO_MODEL: 'whisper-1',
  DALLE3_API_KEY: 'test-key',
  ROBOT_IMAGE_TASK_URL: 'https://test.com/robot-image',
  ROBOT_IMAGE_TASK_NAME: 'robot-image',
  FILES_FROM_FACTORY_TASK_URL: 'https://test.com/files-from-factory',
  FILES_FROM_FACTORY_TASK_NAME: 'files-from-factory',
  ARTICLE_ANALYSER_QUESTIONS_URL: 'https://test.com/article-analyser-questions',
  ARTICLE_ANALYSER_TASK_NAME: 'article-analyser',
  ARTICLE_ANALYSER_DATA_URL: 'https://test.com/article-analyser-data',
  ARTICLE_ANALYSER_ARTICLE_PATH: '/article/path',
};

export function withMockedEnv(fn: () => Promise<void>) {
  return async () => {
    const realEnv = Deno.env;
    // Create mock env object
    const mockEnv = {
      get: (key: string) => mockEnvVars[key as keyof typeof mockEnvVars] || null,
      toObject: () => ({ ...mockEnvVars }),
    };

    // Replace Deno.env with our mock
    Object.defineProperty(Deno, 'env', {
      value: mockEnv,
      configurable: true,
    });

    try {
      await fn();
    } finally {
      // Restore the real Deno.env
      Object.defineProperty(Deno, 'env', {
        value: realEnv,
        configurable: true,
      });
    }
  };
}

export const mockAIClient: AnthropicClient = {
  chat: (_: {
    systemPrompt: string;
    messages: ChatMessage[];
    options?: ChatOptions;
  }) => Promise.resolve('test'),
};

export function getMockEnvConfig(): EnvConfig {
  return {
    targetCompanyUrl: 'https://test.com',
    username: 'test_user',
    password: 'test_pass',
    anthropicApiKey: 'test_anthropic_key',
    aiModel: 'test_model',
    targetCompanyVerificationEndpoint: 'https://test.com/verify',
    calibrationFileUrl: 'https://test.com/calibration',
    aiDevsApiKey: 'test_ai_devs_key',
    aiDevsVerificationUrl: 'https://test.com/verify',
    firecrawlApiKey: 'test_firecrawl_key',
    censorshipTaskUrl: 'https://test.com/censorship',
    auditionsTaskMp3sUrl: 'https://test.com/auditions',
    auditionsTaskName: 'auditions',
    openAiApiKey: 'test-key',
    openAiAudioModel: 'whisper-1',
    dalle3ApiKey: 'test-key',
    robotImageTaskUrl: 'https://test.com/robot-image',
    robotImageTaskName: 'robot-image',
    filesFromFactoryTaskUrl: 'https://test.com/files-from-factory',
    filesFromFactoryTaskName: 'files-from-factory',
    articleAnalyserQuestionsUrl: 'https://test.com/article-analyser-questions',
    articleAnalyserTaskName: 'article-analyser',
    articleAnalyserDataUrl: 'https://test.com/article-analyser-data',
    articleAnalyserArticlePath: '/article/path',
  };
}

export function getMockAiClient() {
  return {
    chat: () => Promise.resolve('mock response'),
  };
}

export function getMockVerificationClient() {
  return {
    verify: () => Promise.resolve({ code: 0, message: 'success' }),
  };
}
