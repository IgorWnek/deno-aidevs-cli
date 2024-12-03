import { zip } from 'https://deno.land/x/compress@v0.5.2/mod.ts';

export class ZipFilesService {
  private readonly MAX_DEPTH = 5;
  private readonly MAX_FILES = 1000;
  private processedFiles = new Set<string>();

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

  private async isEncryptedZip(filePath: string): Promise<boolean> {
    try {
      const file = await Deno.open(filePath);
      const buffer = new Uint8Array(30); // Read first 30 bytes to check the header
      await file.read(buffer);
      file.close();

      // Check for encryption bit in the general purpose bit flag
      // Bytes 6-7 contain the general purpose bit flag
      // Bit 0 (LSB) of this flag indicates encryption
      const generalPurposeBitFlag = buffer[6] | (buffer[7] << 8);
      return (generalPurposeBitFlag & 0x1) === 0x1;
    } catch {
      return false;
    }
  }

  async unzipFile(
    payload: {
      fileName: string;
      zipDirectoryPath: string;
      unzippedDirectoryPath: string;
      currentDepth?: number;
      unzipRecursively?: boolean;
    },
  ): Promise<void> {
    const {
      fileName,
      zipDirectoryPath,
      unzippedDirectoryPath,
      currentDepth = 0,
      unzipRecursively = false,
    } = payload;

    if (currentDepth >= this.MAX_DEPTH) {
      throw new Error(`Maximum zip nesting depth (${this.MAX_DEPTH}) exceeded`);
    }

    const zipFilePath = `${zipDirectoryPath}/${fileName}`;

    try {
      await Deno.stat(zipFilePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`ZIP file not found at path: ${zipFilePath}`);
      }
      throw error;
    }

    if (await this.isEncryptedZip(zipFilePath)) {
      console.warn(`Warning: Encrypted ZIP file encountered: ${fileName}`);
      const encryptedDir = `${zipDirectoryPath}/encrypted`;
      await this.initFileSystem(encryptedDir);
      await Deno.rename(zipFilePath, `${encryptedDir}/${fileName}`);
      return;
    }

    try {
      await zip.uncompress(zipFilePath, unzippedDirectoryPath);
    } catch (error: unknown) {
      throw new Error(`Failed to unzip file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (unzipRecursively) {
      for await (const entry of Deno.readDir(unzippedDirectoryPath)) {
        if (this.processedFiles.size >= this.MAX_FILES) {
          throw new Error('Too many files in zip archives');
        }

        const entryPath = `${unzippedDirectoryPath}/${entry.name}`;
        if (await this.isZipFile(entryPath)) {
          this.processedFiles.add(entryPath);

          const nestedUnzipDir = `${unzippedDirectoryPath}/${entry.name}_extracted`;
          await this.initFileSystem(nestedUnzipDir);

          await this.unzipFile({
            fileName: entry.name,
            zipDirectoryPath: unzippedDirectoryPath,
            unzippedDirectoryPath: nestedUnzipDir,
            currentDepth: currentDepth + 1,
            unzipRecursively: true,
          });
        }
      }
    }
  }

  private async isZipFile(filePath: string): Promise<boolean> {
    try {
      const file = await Deno.open(filePath);
      const buffer = new Uint8Array(2);
      await file.read(buffer);
      file.close();

      return buffer[0] === 0x50 && buffer[1] === 0x4B;
    } catch {
      return false;
    }
  }
}
