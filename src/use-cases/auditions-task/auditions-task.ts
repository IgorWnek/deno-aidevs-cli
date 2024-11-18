import { EnvConfig } from '../../config/env.ts';
import { AiClient } from '../../ai/client.ts';
import { Mp3FilesService } from './services/mp3-files-service.ts';

export async function auditionsTask(
  config: EnvConfig,
  mp3FilesService: Mp3FilesService,
  _aiClient: AiClient,
): Promise<void> {
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
