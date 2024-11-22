export interface ImageClient {
  generateImage(prompt: string): Promise<string>;
}
