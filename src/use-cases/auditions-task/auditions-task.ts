import { EnvConfig } from '../../config/env.ts';
import { AiChatClient } from '../../ai-clients/ai-chat-client.ts';
import { Mp3FilesService } from './services/mp3-files-service.ts';
import { AudioClient } from '../../ai-clients/audio-client.ts';

export async function auditionsTask(deps: {
  config: EnvConfig;
  mp3FilesService: Mp3FilesService;
  aiChatClient: AiChatClient;
  audioClient: AudioClient;
}): Promise<void> {
  const { config, mp3FilesService, aiChatClient, audioClient } = deps;
  const response: Response = await fetch(config.auditionsTaskMp3sUrl);
  const zipFileName = 'auditions.zip';
  const zipFileType = 'application/zip';

  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const zipFile = new File([blob], zipFileName, { type: zipFileType });

  await mp3FilesService.initFileSystem();
  await mp3FilesService.saveZipFile(zipFile);
  await mp3FilesService.unzipFile(zipFileName);
}
