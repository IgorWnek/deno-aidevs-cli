export const MEDIA_CONTEXT_PROMPT = `You are an expert at analyzing article content and providing context for media files.
Given an article content and a media file path, provide a brief (2-3 sentences) context description explaining where and how this media appears in the article and what it represents.
Focus only on the specific media file's context within the article. Don't describe the media content itself.
Write the context in Polish only.`;

export const MEDIA_CONTEXT_USER_PROMPT = (articleContent: string, mediaPath: string) =>
`Article content:
---
${articleContent}
---

Media file path: ${mediaPath}

Provide a brief context for this media file based on its placement and role in the article.`;