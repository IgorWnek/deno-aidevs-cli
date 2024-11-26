import { zip } from 'https://deno.land/x/compress@v0.5.2/mod.ts';

export class ZipFilesService {
  async cleanDirectory(directory: string): Promise<void> {
    try {
      await Deno.remove(directory, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  async initFileSystem(directory: string): Promise<void> {
    await Deno.mkdir(directory, { recursive: true });
  }

  async saveZipFile(zipFile: File, directoryPath: string): Promise<void> {
    const filePath = `${directoryPath}/${zipFile.name}`;
    console.log(`Saving ZIP file to ${filePath}`);
    await Deno.writeFile(filePath, new Uint8Array(await zipFile.arrayBuffer()));
  }

  async unzipFile(
    payload: { fileName: string; zipDirectoryPath: string; unzippedDirectoryPath: string },
  ): Promise<void> {
    const { fileName, zipDirectoryPath, unzippedDirectoryPath } = payload;
    const zipFilePath = `${zipDirectoryPath}/${fileName}`;

    try {
      await Deno.stat(zipFilePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`ZIP file not found at path: ${zipFilePath}`);
      }
      throw error;
    }

    try {
      await zip.uncompress(zipFilePath, unzippedDirectoryPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to unzip file ${fileName}: ${errorMessage}`);
    }
  }
}
