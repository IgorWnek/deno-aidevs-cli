import { AnthropicClient, ImageContent } from '../ai-clients/anthropic-ai-chat-client.ts';
import { exists } from 'https://deno.land/std@0.224.0/fs/exists.ts';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';

export async function recogniseCity(deps: { aiChatClient: AnthropicClient }): Promise<void> {
  const { aiChatClient } = deps;
  const cityDetailsPath = new URL('../../tmp/city-details', import.meta.url).pathname;

  if (!await exists(cityDetailsPath)) {
    throw new Error('City details directory not found');
  }

  const imageFiles = [];
  for await (const entry of Deno.readDir(cityDetailsPath)) {
    if (entry.isFile && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const imageData = await Deno.readFile(`${cityDetailsPath}/${entry.name}`);
      // TODO(@igor): Image should be optimised for the AI model.
      const base64Image = encodeBase64(imageData);
      const mediaType = entry.name.toLowerCase().endsWith('png') ? 'image/png' as const : 'image/jpeg' as const;
      imageFiles.push({ data: base64Image, mediaType });
    }
  }

  if (imageFiles.length === 0) {
    throw new Error('No image files found in the directory');
  }

  const content: ImageContent[] = imageFiles.map((img) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: img.mediaType,
      data: img.data,
    },
  }));

  const systemPrompt = `
Which polish city is shown here? Remember, one of the images shows another city.
Focus on the streets names and layout of the city.
Tips: in the city must be granaries and castle.
  `;

  const response = await aiChatClient.chat({
    systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          ...content,
          {
            type: 'text',
            text: 'Here are the map fragments.',
          },
        ],
      },
    ],
    options: {
      model: 'claude-3-5-sonnet-20241022',
    },
  });

  console.log('City recognition response:');
  console.log(response, '\n\n');
}
