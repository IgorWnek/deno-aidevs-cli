export interface ArticleAnalyserConfig {
  articleUrl: string;
  questionsUrl: string;
  taskName: string;
}

export function createArticleAnalyserConfig(envConfig: EnvConfig): ArticleAnalyserConfig {
  return {
    articleUrl: envConfig.articleAnalyserArticleUrl,
    questionsUrl: envConfig.articleAnalyserQuestionsUrl,
    taskName: envConfig.articleAnalyserTaskName,
  };
}
