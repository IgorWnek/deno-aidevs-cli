import { ZipFilesService } from './../services/zip-files-service.ts';
import { EnvConfig } from '../config/env.ts';
import { FilesService } from '../services/files-service.ts';
import { AnthropicClient, MediaType } from '../ai-clients/anthropic-ai-chat-client.ts';

type Options = {
  cleanFiles: boolean;
  trackEncryptedFiles?: boolean;
};

type FilesFromFactoryPayload = {
  config: EnvConfig;
  zipFilesService: ZipFilesService;
  filesService: FilesService;
  aiClient: AnthropicClient;
  options: Options;
};

export async function filesFromFactory(payload: FilesFromFactoryPayload): Promise<void> {
  const { config, zipFilesService, filesService, aiClient, options } = payload;
  const { filesFromFactoryTaskUrl, filesFromFactoryTaskName } = config;
  const tmpDir = new URL('../../tmp/files-from-factory', import.meta.url).pathname;
  const zipFilesDir = `${tmpDir}/zipped`;
  const unzippedFilesDir = `${tmpDir}/unzipped`;

  if (options.cleanFiles) {
    await zipFilesService.cleanDirectory(zipFilesDir);
    await zipFilesService.cleanDirectory(unzippedFilesDir);
  }

  await zipFilesService.initFileSystem(zipFilesDir);
  await zipFilesService.initFileSystem(unzippedFilesDir);

  const zipFile = await downloadZipFile(filesFromFactoryTaskUrl, filesFromFactoryTaskName);

  const encryptedFiles: string[] = [];

  await unzipFile({
    zipFile,
    zipFilesDir,
    unzippedFilesDir,
    zipFilesService,
    options,
  });

  if (options.trackEncryptedFiles) {
    await trackEncryptedFiles(zipFilesDir, encryptedFiles);
  }

  await processFiles(unzippedFilesDir, filesService, aiClient);
}

async function trackEncryptedFiles(
  zipFilesDir: string,
  encryptedFiles: string[],
): Promise<void> {
  const encryptedDir = `${zipFilesDir}/encrypted`;

  try {
    for await (const file of Deno.readDir(encryptedDir)) {
      encryptedFiles.push(file.name);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn('No encrypted files found');
      return;
    } else {
      throw error;
    }
  }

  if (encryptedFiles.length > 0) {
    console.warn('The following encrypted files were found:');
    encryptedFiles.forEach((file) => console.warn(`- ${file}`));
  }
}

async function downloadZipFile(
  filesFromFactoryTaskUrl: string,
  filesFromFactoryTaskName: string,
): Promise<File> {
  const response = await fetch(filesFromFactoryTaskUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const zipFileName = `${filesFromFactoryTaskName}.zip`;
  return new File([blob], zipFileName, { type: 'application/zip' });
}

async function unzipFile(
  payload: {
    zipFile: File;
    zipFilesDir: string;
    unzippedFilesDir: string;
    zipFilesService: ZipFilesService;
    options: Options;
  },
): Promise<void> {
  const { zipFile, zipFilesDir, unzippedFilesDir, zipFilesService } = payload;

  await zipFilesService.saveZipFile(zipFile, zipFilesDir);
  await zipFilesService.unzipFile({
    fileName: zipFile.name,
    zipDirectoryPath: zipFilesDir,
    unzippedDirectoryPath: unzippedFilesDir,
    unzipRecursively: true,
  });
}

interface TextCategorizationResponse {
  'text-category': 'people' | 'hardware' | 'other';
}

async function categorizeTextContent(
  content: string,
  aiClient: AnthropicClient,
): Promise<TextCategorizationResponse> {
  const systemPrompt = `
You are a text classification assistant. Analyze the provided text and determine if it relates to:
- captured PEOPLE or situations where PEOPLE were spotted somewhere,
- fixed HARDWARE faults.
Return a JSON response with a "text-category" field containing the applicable category: "people", "hardware" or "other".
Return only with the JSON and nothing else.

Example responses:
<example>
{ "text-category": "people" }
</example>

<example>
{ "text-category": "hardware" }
</example>

<example>
{ "text-category": "other" }
</example>

The text to analyze is:

${content}
`;

  const response = await aiClient.chat({
    systemPrompt,
    messages: [{
      role: 'user',
      content: `Analyze this text and categorize it:\n\n${content}`,
    }],
    options: {
      temperature: 0.2,
    },
  });

  console.log('AI response: ', response);

  return JSON.parse(response) as TextCategorizationResponse;
}

async function processFiles(
  unzippedFilesDir: string,
  filesService: FilesService,
  aiClient: AnthropicClient,
): Promise<void> {
  const assignedFiles: { people: string[]; hardware: string[] } = { people: [], hardware: [] };

  for await (const file of filesService.readFilesFromDirectory(unzippedFilesDir)) {
    let content: string;
    const filePath = `${unzippedFilesDir}/${file.name}`;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'txt') {
        content = await Deno.readTextFile(filePath);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
        content = await getTextFromMedia(filePath, fileExtension!, aiClient);
      } else {
        console.warn(`Skipping unsupported file type: ${file.name}`);
        continue;
      }

      const fileCategory = await categorizeTextContent(content, aiClient);
      console.log(`File ${file.name} category:`, fileCategory['text-category']);

      if (fileCategory['text-category'] === 'other') {
        continue;
      }

      assignedFiles[fileCategory['text-category']].push(file.name);
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
    }
  }

  console.log('Assigned files: ', assignedFiles);
}

async function getTextFromMedia(
  filePath: string,
  fileType: string,
  aiClient: AnthropicClient,
): Promise<string> {
  const fileData = await Deno.readFile(filePath);
  const base64Data = encode(fileData);

  let mediaType: MediaType;
  switch (fileType.toLowerCase()) {
    case 'png':
      mediaType = 'image/png';
      break;
    case 'jpg':
    case 'jpeg':
      mediaType = 'image/jpeg';
      break;
    case 'gif':
      mediaType = 'image/gif';
      break;
    case 'webp':
      mediaType = 'image/webp';
      break;
    default:
      throw new Error(`Unsupported media type: ${fileType}`);
  }

  const response = await aiClient.chat({
    systemPrompt: 'Describe what you see in this image in detail.',
    messages: [{
      role: 'user',
      content: [{
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      }],
    }],
  });

  return response;
}

function encode(data: Uint8Array): string {
  const binString = Array.from(data, (x) => String.fromCodePoint(x)).join('');
  return btoa(binString);
}
