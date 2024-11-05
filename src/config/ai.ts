export interface EnvConfig {
  targetCompanyUrl: string;
  username: string;
  password: string;
  anthropicApiKey: string;
  aiModel: string;
}

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
