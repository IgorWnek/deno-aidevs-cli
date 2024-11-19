import { EnvConfig } from '../../config/env.ts';
import { AiChatClient } from '../../ai-clients/ai-chat-client.ts';
import { AudioFilesService } from './services/audio-files-service.ts';
import { AudioClient } from '../../ai-clients/audio-client.ts';

export async function auditionsTask(deps: {
  config: EnvConfig;
  audioFilesService: AudioFilesService;
  aiChatClient: AiChatClient;
  audioClient: AudioClient;
}): Promise<void> {
  const { config, audioFilesService, aiChatClient, audioClient } = deps;
  const response: Response = await fetch(config.auditionsTaskMp3sUrl);
  const zipFileName = 'auditions.zip';
  const zipFileType = 'application/zip';

  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const zipFile = new File([blob], zipFileName, { type: zipFileType });

  await audioFilesService.initFileSystem();
  await audioFilesService.saveZipFile(zipFile);
  await audioFilesService.unzipFile(zipFileName);

  const audioFiles = await audioFilesService.findAudioFiles();
  console.log(`Found ${audioFiles.length} audio files to process`);

  for (const audioFile of audioFiles) {
    try {
      console.log(`Processing file: ${audioFile.name}`);
      const transcription = await audioClient.transcribe(audioFile);
      console.log(`Transcription for ${audioFile.name}:`);
      console.log(transcription.text);
      console.log('---');
    } catch (error) {
      console.error(
        `Error processing ${audioFile.name}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
