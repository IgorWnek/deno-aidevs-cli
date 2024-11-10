export class FileService {
  private readonly tmpDir = '../tmp';

  async ensureTmpDirectory(): Promise<void> {
    try {
      await Deno.stat(this.tmpDir);
    } catch {
      await Deno.mkdir(this.tmpDir);
    }
  }

  async downloadAndSaveFile(url: string, filename: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const data = await response.text();
    const filePath = `${this.tmpDir}/${filename}`;
    await Deno.writeTextFile(filePath, data);

    return filePath;
  }
}
