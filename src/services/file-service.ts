export class FileService {
  private readonly tmpDir: string;

  constructor(basePath?: string) {
    this.tmpDir = basePath 
      ? `${basePath}/tmp`
      : new URL('../../tmp', import.meta.url).pathname;
  }

  async ensureTmpDirectory(): Promise<string> {
    try {
      const stat = await Deno.stat(this.tmpDir);
      if (!stat.isDirectory) {
        throw new Error('tmp path exists but is not a directory');
      }
    } catch {
      await Deno.mkdir(this.tmpDir, { recursive: true });
    }
    return this.tmpDir;
  }

  async saveFile(filename: string, data: string): Promise<void> {
    const tmpDir = await this.ensureTmpDirectory();
    const filePath = `${tmpDir}/${filename}`;
    await Deno.writeTextFile(filePath, data);
  }

  async readFile<T>(filename: string): Promise<T> {
    const tmpDir = await this.ensureTmpDirectory();
    const filePath = `${tmpDir}/${filename}`;
    const content = await Deno.readTextFile(filePath);
    return JSON.parse(content) as T;
  }
}
