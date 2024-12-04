export class FilesService {
  async *readFilesFromDirectory(directoryPath: string): AsyncGenerator<File> {
    for await (const entry of Deno.readDir(directoryPath)) {
      if (!entry.isFile) continue;

      const fileExtension = entry.name.split('.').pop()?.toLowerCase();
      // TODO(@igor) try to find extension if there's a file without extension
      if (!fileExtension) continue;

      const filePath = `${directoryPath}/${entry.name}`;
      const fileContent = await Deno.readFile(filePath);
      yield new File([fileContent], entry.name);
    }
  }
}
