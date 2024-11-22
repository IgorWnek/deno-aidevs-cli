import { EnvConfig } from '../../config/env.ts';
import { AnthropicChatClient } from '../../ai-clients/ai-chat-client.ts';
import { AudioFilesService } from './services/audio-files-service.ts';
import { AudioClient } from '../../ai-clients/audio-client.ts';
import { TxtFilesService } from './services/txt-files-service.ts';
import { VerificationApiClient } from '../../clients/verification-api-client.ts';

export async function auditionsTask(deps: {
  config: EnvConfig;
  audioFilesService: AudioFilesService;
  txtFilesService: TxtFilesService;
  aiChatClient: AnthropicChatClient;
  audioClient: AudioClient;
  verificationClient: VerificationApiClient;
}): Promise<void> {
  const { config, audioFilesService, txtFilesService, aiChatClient, audioClient, verificationClient } = deps;
  const { auditionsTaskMp3sUrl, auditionsTaskName } = config;

  const existingTranscriptions = await txtFilesService.findTxtFiles();
  let transcriptionsWithMetadata: { filename: string; text: string }[];

  if (existingTranscriptions.length > 0) {
    console.log(`Found ${existingTranscriptions.length} existing transcriptions`);
    transcriptionsWithMetadata = await Promise.all(
      existingTranscriptions.map(async (file) => ({
        filename: file.name,
        text: await file.text(),
      })),
    );
  } else {
    console.log('No existing transcriptions found, processing audio files...');
    const response: Response = await fetch(auditionsTaskMp3sUrl);
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

    transcriptionsWithMetadata = await Promise.all(
      audioFiles.map(async (audioFile) => {
        try {
          console.log(`Processing file: ${audioFile.name}`);
          const transcription = await audioClient.transcribe(audioFile);
          console.log(`Transcription for ${audioFile.name}:`);
          console.log(transcription.text);
          console.log('---');
          return {
            filename: audioFile.name,
            text: transcription.text,
          };
        } catch (error) {
          console.error(
            `Error processing ${audioFile.name}:`,
            error instanceof Error ? error.message : String(error),
          );
          return null;
        }
      }),
    ).then((results) => results.filter((r): r is { filename: string; text: string } => r !== null));

    await Promise.all(
      transcriptionsWithMetadata.map(async ({ filename, text }) => {
        const txtFilename = filename.replace(/\.[^/.]+$/, '.txt');
        const txtFile = new File([text], txtFilename, { type: 'text/plain' });
        await txtFilesService.saveTxtFile(txtFile);
        console.log(`Saved transcription to ${txtFilename}`);
      }),
    );
  }

  const transcriptionsText = transcriptionsWithMetadata
    .map(({ filename, text }) => `Audition from file ${filename}:\n${text}`)
    .join('\n\n');

  const systemPrompt = `You are a helpful assistant analyzing transcriptions from audio recordings.
Your task is to find and extract specific information about dr Andrzej Maj's workplace location.
Find clues about the university name and location in the transcriptions. Unfortunately, the exact location may not be mentioned.
To find the street name, you need to look for clues in the transcriptions and use your knowledge about the city.
Before giving your answer, take the deep breath and think. Answer only with the street name basing on the clues and your knowledge.

${transcriptionsText}`;

  const userPrompt =
    'On which street is the university where dr Andrzej Maj is working currently? Answer with just the street name and nothing else.';

  const chatResponse = await aiChatClient.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  console.log('AI Response:', chatResponse);

  const verificationResult = await verificationClient.verify(auditionsTaskName, chatResponse);
  console.log(`Verification result: \ncode: ${verificationResult.code}\nmessage: ${verificationResult.message}`);
}
