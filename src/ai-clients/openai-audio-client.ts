import OpenAI from 'npm:openai';
import { AudioClient, TranscriptionResult } from './audio-client.ts';

export interface AudioClientConfig {
  apiKey: string;
  model?: string;
}

export class OpenAiAudioClient implements AudioClient {
  private client: OpenAI;
  private model: string;
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  private readonly SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

  constructor(config: AudioClientConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model ?? 'whisper-1';
  }

  async transcribe(
    file: File | Blob,
    options?: {
      language?: string;
      prompt?: string;
    },
  ): Promise<TranscriptionResult> {
    this.validateFile(file);

    const uploadableFile = file instanceof File ? file : new File([file], 'audio.webm');

    try {
      const response = await this.client.audio.transcriptions.create({
        file: uploadableFile,
        model: this.model,
        language: options?.language,
        prompt: options?.prompt,
      });

      return { text: response.text };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw error;
    }
  }

  private validateFile(file: File | Blob): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`);
    }

    if (file instanceof File) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !this.SUPPORTED_FORMATS.includes(extension)) {
        throw new Error(
          `Unsupported file format. Supported formats are: ${this.SUPPORTED_FORMATS.join(', ')}`,
        );
      }
    }
  }
}
