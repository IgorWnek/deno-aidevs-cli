import { EnvConfig } from './env.ts';

export interface ArticleAnalyserConfig {
  dataUrl: string;
  articlePath: string;
  questionsUrl: string;
  taskName: string;
}

export function createArticleAnalyserConfig(envConfig: EnvConfig): ArticleAnalyserConfig {
  return {
    dataUrl: envConfig.articleAnalyserDataUrl,
    articlePath: envConfig.articleAnalyserArticlePath,
    questionsUrl: envConfig.articleAnalyserQuestionsUrl,
    taskName: envConfig.articleAnalyserTaskName,
  };
}
