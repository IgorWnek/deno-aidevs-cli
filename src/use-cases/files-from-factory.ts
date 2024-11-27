import { ZipFilesService } from './../services/zip-files-service.ts';
import { EnvConfig } from '../config/env.ts';
import { FilesService } from '../services/files-service.ts';

type Options = {
  cleanFiles: boolean;
};

type FilesFromFactoryPayload = {
  config: EnvConfig;
  zipFilesService: ZipFilesService;
  filesService: FilesService;
  options: Options;
};

export async function filesFromFactory(payload: FilesFromFactoryPayload): Promise<void> {
  const { config, zipFilesService, filesService, options } = payload;
  const { filesFromFactoryTaskUrl, filesFromFactoryTaskName } = config;
  const tmpDir = new URL('../../tmp/files-from-factory', import.meta.url).pathname;
  const zipFilesDir = `${tmpDir}/zipped`;
  const unzippedFilesDir = `${tmpDir}/unzipped`;

  await downloadAndUnzipFiles({
    filesFromFactoryTaskUrl,
    filesFromFactoryTaskName,
    zipFilesDir,
    unzippedFilesDir,
    zipFilesService,
    options,
  });

  for await (const file of filesService.readFilesFromDirectory(unzippedFilesDir)) {
    console.log(file.name);
  }
}

async function downloadAndUnzipFiles(
  payload: {
    filesFromFactoryTaskUrl: string;
    filesFromFactoryTaskName: string;
    zipFilesDir: string;
    unzippedFilesDir: string;
    zipFilesService: ZipFilesService;
    options: Options;
  },
): Promise<void> {
  const { filesFromFactoryTaskUrl, filesFromFactoryTaskName, zipFilesDir, unzippedFilesDir, zipFilesService, options } =
    payload;

  const response = await fetch(filesFromFactoryTaskUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP file: ${response.statusText}`);
  }

  if (options.cleanFiles) {
    await zipFilesService.cleanDirectory(zipFilesDir);
    await zipFilesService.cleanDirectory(unzippedFilesDir);
  }

  await zipFilesService.initFileSystem(zipFilesDir);
  await zipFilesService.initFileSystem(unzippedFilesDir);

  const blob = await response.blob();
  const zipFileName = `${filesFromFactoryTaskName}.zip`;
  const zipFile = new File([blob], zipFileName, { type: 'application/zip' });
  await zipFilesService.saveZipFile(zipFile, zipFilesDir);
  await zipFilesService.unzipFile({
    fileName: zipFileName,
    zipDirectoryPath: zipFilesDir,
    unzippedDirectoryPath: unzippedFilesDir,
  });
}
