import { ArticleAnalyserConfig } from '../config/article-analyser-config.ts';
import { CrawlingService } from '../services/crawling-service.ts';
import { ensureDir } from 'https://deno.land/std/fs/ensure_dir.ts';
import { join } from 'https://deno.land/std/path/mod.ts';
import { AnthropicClient } from '../ai-clients/anthropic-ai-chat-client.ts';
import { MEDIA_CONTEXT_PROMPT, MEDIA_CONTEXT_USER_PROMPT } from '../prompts/media-context.ts';

type ArticleAnalyserOptions = {
  archiveScrapedArticle: boolean;
};

type ArticleAnalyserPayload = {
  config: ArticleAnalyserConfig;
  options: ArticleAnalyserOptions;
  crawlingService: CrawlingService;
  anthropicChatClient: AnthropicClient;
};

interface MediaContext {
  path: string;
  context: string;
}

const SCRAPED_ARTICLES_DIR = 'tmp/article-analyser';
const SCRAPED_ARTICLE_FILENAME = 'scraped-article.md';
const MEDIA_CONTEXTS_FILENAME = 'media-contexts.json';

export async function articleAnalyser(
  { config, options, crawlingService, anthropicChatClient }: ArticleAnalyserPayload,
): Promise<void> {
  console.log('Starting article analyser');
  console.log('--------------------------------');
  console.log('Enabled options:');
  console.log('\n- archive scraped article: ', options.archiveScrapedArticle);
  console.log('--------------------------------');

  const articlePath = join(Deno.cwd(), SCRAPED_ARTICLES_DIR, SCRAPED_ARTICLE_FILENAME);
  const fullUrl = `${config.dataUrl}${config.articlePath}`;
  const articleContent = await loadArticleContent(articlePath) ??
    await scrapeAndSaveArticle(crawlingService, fullUrl, articlePath);

  const mediaFiles = extractMediaFiles(articleContent);
  console.log('\nFound media files:');
  mediaFiles.forEach((file) => console.log(`- ${file}`));

  const mediaContexts = await loadMediaContexts() ??
    await generateAndSaveMediaContexts(mediaFiles, articleContent, anthropicChatClient);

  console.log('\nMedia contexts:');
  mediaContexts.forEach(({ path, context }) => {
    console.log(`\n${path}:`);
    console.log(context);
  });
}

async function loadArticleContent(path: string): Promise<string | null> {
  try {
    const content = await Deno.readTextFile(path);
    console.log('Article already scraped, using cached version');
    return content;
  } catch {
    return null;
  }
}

async function scrapeAndSaveArticle(
  crawlingService: CrawlingService,
  url: string,
  savePath: string,
): Promise<string> {
  const content = await crawlingService.crawlUrl(url);
  await ensureDir(join(Deno.cwd(), SCRAPED_ARTICLES_DIR));
  await Deno.writeTextFile(savePath, content);
  console.log('Article scraped and saved successfully');
  return content;
}

function extractMediaFiles(content: string): string[] {
  const mediaRegex = /!\[.*?\]\((.*?)\)|(?:src=["'](.*?)["'])|(?:\[.*?\]\((.*?\.(?:jpg|jpeg|png|gif|mp3|wav))\))/gi;
  const matches = [...content.matchAll(mediaRegex)]
    .map((match) => match[1] || match[2] || match[3])
    .filter(Boolean); // Remove undefined/null values

  return [...new Set(matches)]; // Remove duplicates
}

async function loadMediaContexts(): Promise<MediaContext[] | null> {
  const contextsPath = join(Deno.cwd(), SCRAPED_ARTICLES_DIR, MEDIA_CONTEXTS_FILENAME);
  try {
    const content = await Deno.readTextFile(contextsPath);
    console.log('Found existing media contexts, using cached version');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function generateMediaContexts(
  mediaFiles: string[],
  articleContent: string,
  aiClient: AnthropicClient,
): Promise<MediaContext[]> {
  const contextPromises = mediaFiles.map(async (mediaPath): Promise<MediaContext> => {
    const context = await aiClient.chat({
      systemPrompt: MEDIA_CONTEXT_PROMPT,
      messages: [{
        role: 'user',
        content: MEDIA_CONTEXT_USER_PROMPT(articleContent, mediaPath),
      }],
      options: {
        temperature: 0.7,
        maxTokens: 600,
      },
    });

    return {
      path: mediaPath,
      context: context.trim(),
    };
  });

  return await Promise.all(contextPromises);
}

async function saveMediaContexts(mediaContexts: MediaContext[]): Promise<void> {
  const contextsPath = join(Deno.cwd(), SCRAPED_ARTICLES_DIR, MEDIA_CONTEXTS_FILENAME);
  await Deno.writeTextFile(contextsPath, JSON.stringify(mediaContexts, null, 2));
  console.log(`\nMedia contexts saved to ${MEDIA_CONTEXTS_FILENAME}`);
}

async function generateAndSaveMediaContexts(
  mediaFiles: string[],
  articleContent: string,
  aiClient: AnthropicClient,
): Promise<MediaContext[]> {
  console.log('\nGenerating context for media files...');
  const mediaContexts = await generateMediaContexts(mediaFiles, articleContent, aiClient);
  await saveMediaContexts(mediaContexts);
  return mediaContexts;
}
