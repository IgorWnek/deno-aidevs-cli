import { zip } from 'https://deno.land/x/compress@v0.5.2/mod.ts';

export class Mp3FilesService {
  private readonly tmpDir: string;
  private readonly zippedFileDir: string;
  private readonly unzippedFilesDir: string;

  constructor(basePath?: string) {
    this.tmpDir = basePath ? `${basePath}/tmp` : new URL('../../../../tmp', import.meta.url).pathname;
    this.zippedFileDir = `${this.tmpDir}/zipped`;
    this.unzippedFilesDir = `${this.tmpDir}/unzipped`;
  }

  async cleanDirectories(): Promise<void> {
    try {
      await Deno.remove(this.zippedFileDir, { recursive: true });
      await Deno.remove(this.unzippedFilesDir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  async initFileSystem(): Promise<void> {
    await this.cleanDirectories();
    await Deno.mkdir(this.zippedFileDir, { recursive: true });
    await Deno.mkdir(this.unzippedFilesDir, { recursive: true });
  }

  async saveZipFile(file: File): Promise<void> {
    const filePath = `${this.zippedFileDir}/${file.name}`;
    console.log(`Saving ZIP file to ${filePath}`);
    await Deno.writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  }

  async unzipFile(fileName: string): Promise<void> {
    const zipFilePath = `${this.zippedFileDir}/${fileName}`;

    try {
      await Deno.stat(zipFilePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`ZIP file not found at path: ${zipFilePath}`);
      }
      throw error;
    }

    try {
      await zip.uncompress(zipFilePath, this.unzippedFilesDir);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to unzip file ${fileName}: ${errorMessage}`);
    }
  }

  async findAudioFiles(): Promise<File[]> {
    const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
    const files: File[] = [];

    for await (const entry of Deno.readDir(this.unzippedFilesDir)) {
      if (!entry.isFile) continue;

      const extension = entry.name.split('.').pop()?.toLowerCase();
      if (extension && SUPPORTED_FORMATS.includes(extension)) {
        const filePath = `${this.unzippedFilesDir}/${entry.name}`;
        const fileContent = await Deno.readFile(filePath);
        files.push(new File([fileContent], entry.name));
      }
    }

    return files;
  }
}
