import { EnvConfig } from './env.ts';

export interface AIConfig {
  apiKey: string;
  model: string;
}

export function createAIConfig(envConfig: Pick<EnvConfig, 'anthropicApiKey' | 'aiModel'>): AIConfig {
  return {
    apiKey: envConfig.anthropicApiKey,
    model: envConfig.aiModel,
  };
}

export interface AudioClientConfig {
  apiKey: string;
  model?: string;
}

export function createOpenAiAudioClientConfig(
  envConfig: Pick<EnvConfig, 'openAiApiKey' | 'openAiAudioModel'>,
): AudioClientConfig {
  return {
    apiKey: envConfig.openAiApiKey,
    model: envConfig.openAiAudioModel,
  };
}

export interface ImageClientConfig {
  apiKey: string;
}

export function createDalle3ImageClientConfig(
  envConfig: Pick<EnvConfig, 'dalle3ApiKey'>,
): ImageClientConfig {
  return {
    apiKey: envConfig.dalle3ApiKey,
  };
}
