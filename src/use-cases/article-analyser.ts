import { ArticleAnalyserConfig } from '../config/article-analyser-config.ts';
import { CrawlingService } from '../services/crawling-service.ts';
import { ensureDir } from 'https://deno.land/std/fs/ensure_dir.ts';
import { join } from 'https://deno.land/std/path/mod.ts';

type ArticleAnalyserOptions = {
  archiveScrapedArticle: boolean;
};

type ArticleAnalyserPayload = {
  config: ArticleAnalyserConfig;
  options: ArticleAnalyserOptions;
  crawlingService: CrawlingService;
};

const SCRAPED_ARTICLES_DIR = 'tmp/article-analyser';
const SCRAPED_ARTICLE_FILENAME = 'scraped-article.md';

export async function articleAnalyser({ config, options, crawlingService }: ArticleAnalyserPayload): Promise<void> {
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
  mediaFiles.forEach(file => console.log(`- ${file}`));

  console.log('\nArticle content (first 200 chars):', articleContent.slice(0, 200));
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
    .map(match => match[1] || match[2] || match[3])
    .filter(Boolean); // Remove undefined/null values

  return [...new Set(matches)]; // Remove duplicates
}
