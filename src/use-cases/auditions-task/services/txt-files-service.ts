import { ensureDir } from 'https://deno.land/std@0.224.0/fs/mod.ts';

export class TxtFilesService {
  private readonly filesDir: string;

  constructor(basePath?: string) {
    this.filesDir = basePath
      ? `${basePath}/tmp/transcriptions`
      : new URL('../../../../tmp/transcriptions', import.meta.url).pathname;
  }

  async findTxtFiles(): Promise<File[]> {
    await ensureDir(this.filesDir);

    const files: File[] = [];
    for await (const entry of Deno.readDir(this.filesDir)) {
      if (!entry.isFile) continue;

      const extension = entry.name.split('.').pop()?.toLowerCase();
      if (!extension || extension !== 'txt') {
        continue;
      }

      const filePath = `${this.filesDir}/${entry.name}`;
      const fileContent = await Deno.readFile(filePath);
      files.push(new File([fileContent], entry.name));
    }

    return files;
  }

  async saveTxtFile(file: File): Promise<void> {
    const filePath = `${this.filesDir}/${file.name}`;
    await Deno.writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  }
}
