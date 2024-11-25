import { robotVerificationKnowledge } from '../../knowledge/robot-verification.ts';
import { robotVerificationSystemPrompt } from '../../prompts/robot-verification-prompt.ts';
import type { EnvConfig } from '../../config/env.ts';
import { AnthropicClient, ChatMessage } from '../../ai-clients/anthropic-ai-chat-client.ts';

interface VerificationRequest {
  msgID: string | number;
  text: string;
}

export async function initializeRobotVerification(
  config: EnvConfig,
  aiChatClient: AnthropicClient,
): Promise<void> {
  const verificationRequest: VerificationRequest = {
    msgID: '0',
    text: 'READY',
  };

  const response = await fetch(config.targetCompanyVerificationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationRequest),
  });

  if (!response.ok) {
    console.error('Robot verification failed');
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('Verification Response:', JSON.stringify(responseData));

  const systemPrompt = robotVerificationSystemPrompt
    .replace('{{knowledge}}', robotVerificationKnowledge);

  const userMessage: ChatMessage = {
    role: 'user',
    content: responseData.text,
  };

  const aiResponse = await aiChatClient.chat({
    systemPrompt,
    messages: [userMessage],
    options: {
      model: 'claude-3-5-sonnet-20241022',
    },
  });

  const aiVerificationRequest: VerificationRequest = {
    msgID: responseData.msgID,
    text: aiResponse,
  };

  console.log(JSON.stringify(aiVerificationRequest));

  const verificationResponse = await fetch(config.targetCompanyVerificationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(aiVerificationRequest),
  });

  if (!verificationResponse.ok) {
    throw new Error(`Verification response failed: ${verificationResponse.status}`);
  }

  const finalResponse = await verificationResponse.json();
  console.log('Final Response:', JSON.stringify(finalResponse));
}
