import { Buffer } from 'node:buffer';
import { AnthropicClient, MediaType } from '../ai-clients/anthropic-ai-chat-client.ts';
import { AudioClient } from '../ai-clients/audio-client.ts';
import { IMAGE_DESCRIPTION_PROMPT, IMAGE_DESCRIPTION_USER_PROMPT } from '../prompts/media-description.ts';

export interface MediaDescriptionService {
  createDescription(mediaUrl: string, context: string): Promise<string>;
}

export class AnthropicMediaDescriptionService implements MediaDescriptionService {
  private readonly SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private readonly SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'webm', 'm4a'];

  constructor(
    private readonly imageClient: AnthropicClient,
    private readonly audioClient: AudioClient,
  ) {}

  async createDescription(mediaUrl: string, context: string): Promise<string> {
    const extension = this.getFileExtension(mediaUrl);

    if (this.SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
      return await this.createImageDescription(mediaUrl, context);
    }

    if (this.SUPPORTED_AUDIO_EXTENSIONS.includes(extension)) {
      return await this.createAudioDescription(mediaUrl, context);
    }

    throw new Error(`Unsupported media type: ${extension}`);
  }

  private async processImage(imageBlob: Blob): Promise<{ data: Buffer; mediaType: string }> {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    return {
      data: Buffer.from(uint8Array),
      mediaType: imageBlob.type || 'image/png',
    };
  }

  private async createImageDescription(imageUrl: string, context: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(`Processing image of size: ${uint8Array.length} bytes`);

      const base64Image = this.encode(uint8Array);
      const mediaType = response.headers.get('content-type') || 'image/png';

      const aiResponse = await this.imageClient.chat({
        systemPrompt: IMAGE_DESCRIPTION_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_DESCRIPTION_USER_PROMPT(context) },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as MediaType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        options: {
          temperature: 0.4,
          maxTokens: 1000,
        },
      });

      return aiResponse.trim();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Failed to process image ${imageUrl}:`, {
          message: error.message,
          stack: error.stack
        });
        return `Failed to analyze image: ${error.message}`;
      }
      return 'Failed to analyze image: Unknown error';
    }
  }

  private encode(data: Uint8Array): string {
    const binString = Array.from(data, (x) => String.fromCodePoint(x)).join('');
    return btoa(binString);
  }

  private async createAudioDescription(audioUrl: string, _context: string): Promise<string> {
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();

    const transcription = await this.audioClient.transcribe(audioBlob);
    return transcription.text;
  }

  private getFileExtension(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() ?? '';
    return extension.split('?')[0];
  }
}
