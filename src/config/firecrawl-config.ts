import { EnvConfig } from './env.ts';

export interface FirecrawlConfig {
  apiKey: string;
}

export function createFirecrawlConfig(envConfig: EnvConfig): FirecrawlConfig {
  return { apiKey: envConfig.firecrawlApiKey };
}
