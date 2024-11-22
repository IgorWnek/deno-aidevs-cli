import { AiChatClient } from '../ai-clients/ai-chat-client.ts';
import { ImageClient } from '../ai-clients/image-client.ts';
import { VerificationApiClient } from '../clients/verification-api-client.ts';
import { EnvConfig } from '../config/env.ts';

interface RobotImageTask {
  description: string;
}

export async function robotImage(
  deps: {
    config: EnvConfig;
    aiChatClient: AiChatClient;
    imageClient: ImageClient;
    verificationClient: VerificationApiClient;
  },
): Promise<void> {
  const { config, aiChatClient, imageClient, verificationClient } = deps;
  const { robotImageTaskUrl, robotImageTaskName } = config;

  const task = await fetch(robotImageTaskUrl);
  const taskData: RobotImageTask = await task.json();

  console.log('Robot description:');
  console.log(taskData.description, '\n\n');

  const systemPrompt = `
You are an expert in preparation of prompts for image generation.
When you prepare a prompt for image generation you always base on the user's description.
Create the best prompt possible for given description, remember that the prompt will be use for image generation so it should be detailed yet concise.
Remember, you can return ONLY THE PROMPT, nothing else.
User can provide description in different language than English, but your response should be only in English.
  `;

  const imageGenerationPrompt = await aiChatClient.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: taskData.description },
  ]);

  console.log('Image generation prompt:');
  console.log(imageGenerationPrompt, '\n\n');

  const imageUrl = await imageClient.generateImage(imageGenerationPrompt);
  console.log('Image URL:');
  console.log(imageUrl, '\n\n');

  const result = await verificationClient.verify(robotImageTaskName, imageUrl);
  console.log('Verification result:');
  console.log(`code: ${result.code}\nmessage: ${result.message}`);
}
