import OpenAI from 'npm:openai';
import { ImageClient } from './image-client.ts';
import { ImageClientConfig } from '../config/ai.ts';

export class Dalle3ImageClient implements ImageClient {
  private client: OpenAI;
  private readonly model = 'dall-e-3';
  private readonly size = '1024x1024';
  private readonly n = 1;
  private readonly MAX_PROMPT_LENGTH = 4000;

  constructor(config: ImageClientConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateImage(prompt: string): Promise<string> {
    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt length (${prompt.length}) exceeds maximum allowed length of ${this.MAX_PROMPT_LENGTH} characters`,
      );
    }

    try {
      const response = await this.client.images.generate({
        model: this.model,
        prompt,
        n: this.n,
        size: this.size,
      });

      if (!response.data[0]?.url) {
        throw new Error('Failed to generate image');
      }

      return response.data[0].url;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw error;
    }
  }
}
