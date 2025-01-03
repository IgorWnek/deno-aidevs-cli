import { ArticleAnalyserConfig } from '../config/article-analyser-config.ts';

type ArticleAnalyserOptions = {
  archiveScrapedArticle: boolean;
}

type ArticleAnalyserPayload = {
  config: ArticleAnalyserConfig
  options: ArticleAnalyserOptions
}

export async function articleAnalyser(payload: ArticleAnalyserPayload): Promise<void> {
  console.log('Starting article analyser');
  console.log('--------------------------------');
  console.log('Enabled options:');
  console.log('\n- archive scraped article: ', payload.options.archiveScrapedArticle);
  console.log('--------------------------------');

}
