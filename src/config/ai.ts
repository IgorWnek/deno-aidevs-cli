import { AnthropicConfig, ClaudeModel } from '../ai-clients/anthropic-ai-chat-client.ts';
import { EnvConfig } from './env.ts';

export function createAnthropicChatClientConfig(
  envConfig: Pick<EnvConfig, 'anthropicApiKey'>,
  model?: ClaudeModel,
): AnthropicConfig {
  return {
    apiKey: envConfig.anthropicApiKey,
    model,
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
