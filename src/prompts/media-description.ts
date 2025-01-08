export const IMAGE_DESCRIPTION_PROMPT = `You are an expert at describing images concisely.
Analyze the provided image and create a brief but informative description (2-3 sentences max).
Take into account the provided context from the article and focus only on the most relevant elements.
Description must be in the same language as the context (Polish or English).`;

export const IMAGE_DESCRIPTION_USER_PROMPT = (context: string) =>
  `Given this context: "${context}", please provide a concise description (2-3 sentences) of what you see in the image.`;
