import { EnvConfig } from '../config/env.ts';

export interface VerificationApiResponse {
  code: number;
  message: string;
}

export interface VerificationApiClient {
  verify<T>(taskName: string, answer: T): Promise<VerificationApiResponse>;
}

export class AiDevsVerificationApiClient implements VerificationApiClient {
  constructor(private readonly config: EnvConfig) {}

  async verify<T>(taskName: string, answer: T): Promise<VerificationApiResponse> {
    const response = await fetch(this.config.aiDevsVerificationUrl, {
      method: 'POST',
      body: JSON.stringify({
        task: taskName,
        apikey: this.config.aiDevsApiKey,
        answer,
      }),
    });

    return response.json() as Promise<VerificationApiResponse>;
  }
}
