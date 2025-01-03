import { FirecrawlConfig } from '../config/firecrawl-config.ts';
import FirecrawlApp from '@mendable/firecrawl-js';

export interface CrawlingService {
  crawlUrl(url: string): Promise<string>;
}

export class FirecrawlService implements CrawlingService {
  private client: FirecrawlApp;

  constructor(config: FirecrawlConfig) {
    this.client = new FirecrawlApp({ apiKey: config.apiKey });
  }

  async crawlUrl(url: string): Promise<string> {
    const result = await this.client.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    });

    console.log('Firecrawl result:', result);

    if (result.error || result.success === false) {
      throw new Error(`Firecrawl error: ${result.error}`);
    }

    if (!result.markdown) {
      throw new Error('No markdown content returned from Firecrawl');
    }

    return result.markdown;
  }
}
