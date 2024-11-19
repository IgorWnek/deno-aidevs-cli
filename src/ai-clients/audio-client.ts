export interface AudioClient {
  transcribe(
    file: File | Blob,
    options?: {
      language?: string;
      prompt?: string;
    },
  ): Promise<TranscriptionResult>;
}

export interface TranscriptionResult {
  text: string;
}
