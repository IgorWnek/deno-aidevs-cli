import { ArticleAnalyserConfig } from '../config/article-analyser-config.ts';
import { CrawlingService } from '../services/crawling-service.ts';
import { ensureDir } from 'https://deno.land/std/fs/ensure_dir.ts';
import { join } from 'https://deno.land/std/path/mod.ts';
import { AnthropicClient } from '../ai-clients/anthropic-ai-chat-client.ts';
import { MEDIA_CONTEXT_PROMPT, MEDIA_CONTEXT_USER_PROMPT } from '../prompts/media-context.ts';
import { MediaDescriptionService } from '../services/media-description-service.ts';

type ArticleAnalyserOptions = {
  archiveScrapedArticle: boolean;
};

type ArticleAnalyserPayload = {
  config: ArticleAnalyserConfig;
  options: ArticleAnalyserOptions;
  crawlingService: CrawlingService;
  anthropicChatClient: AnthropicClient;
  mediaDescriptionService: MediaDescriptionService;
};

interface MediaContext {
  path: string;
  context: string;
}

interface MediaDetails {
  path: string;
  context: string;
  description: string;
}

const SCRAPED_ARTICLES_DIR = 'tmp/article-analyser';
const SCRAPED_ARTICLE_FILENAME = 'scraped-article.md';
const MEDIA_DETAILS_FILENAME = 'media-details.json';

export async function articleAnalyser(
  { config, options, crawlingService, anthropicChatClient, mediaDescriptionService }: ArticleAnalyserPayload,
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

  const mediaDetails = await loadMediaDetails() ?? await (async () => {
    const mediaContexts = await generateMediaContexts(mediaFiles, articleContent, anthropicChatClient);
    const details = await generateMediaDescriptions(mediaContexts, mediaDescriptionService, config);
    await saveMediaDetails(details);
    return details;
  })();

  console.log('\nMedia details:');
  mediaDetails.forEach(({ path, context, description }) => {
    console.log(`\n${path}:`);
    console.log('Context:', context);
    console.log('Description:', description);
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

async function loadMediaDetails(): Promise<MediaDetails[] | null> {
  const detailsPath = join(Deno.cwd(), SCRAPED_ARTICLES_DIR, MEDIA_DETAILS_FILENAME);
  try {
    const content = await Deno.readTextFile(detailsPath);
    console.log('Found existing media details, using cached version');
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

async function saveMediaDetails(mediaDetails: MediaDetails[]): Promise<void> {
  const detailsPath = join(Deno.cwd(), SCRAPED_ARTICLES_DIR, MEDIA_DETAILS_FILENAME);
  await Deno.writeTextFile(detailsPath, JSON.stringify(mediaDetails, null, 2));
  console.log(`\nMedia details saved to ${MEDIA_DETAILS_FILENAME}`);
}

async function generateMediaDescriptions(
  mediaContexts: MediaContext[],
  mediaDescriptionService: MediaDescriptionService,
  config: ArticleAnalyserConfig,
): Promise<MediaDetails[]> {
  console.log('\nGenerating descriptions for media files...');

  const detailsPromises = mediaContexts.map(async ({ path, context }): Promise<MediaDetails> => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const fullMediaUrl = `${config.dataUrl}/${normalizedPath}`;
    console.log(`Processing media: ${fullMediaUrl}`);

    const description = await mediaDescriptionService.createDescription(fullMediaUrl, context);
    return {
      path,
      context,
      description,
    };
  });

  return await Promise.all(detailsPromises);
}
