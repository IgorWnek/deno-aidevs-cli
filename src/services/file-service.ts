export class FileService {
  private readonly tmpDir: string;

  constructor() {
    this.tmpDir = new URL('../../tmp', import.meta.url).pathname;
  }

  async ensureTmpDirectory(): Promise<void> {
    const exists = await this.directoryExists(this.tmpDir);
    if (!exists) {
      await Deno.mkdir(this.tmpDir);
    }
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stat = await Deno.stat(path);
      return stat.isDirectory;
    } catch {
      return false;
    }
  }

  async downloadAndSaveFile(url: string, filename: string): Promise<string> {
    await this.ensureTmpDirectory();
    const response = await fetch(url);
    const data = await response.text();
    const filePath = `${this.tmpDir}/${filename}`;
    await Deno.writeTextFile(filePath, data);

    return filePath;
  }
}
