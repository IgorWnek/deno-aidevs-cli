import { robotVerificationKnowledge } from '../../knowledge/robot-verification.ts';
import { robotVerificationSystemPrompt } from '../../prompts/robot-verification-prompt.ts';
import { AIClient, ChatMessage } from '../../ai/client.ts';
import type { EnvConfig } from '../../config/env.ts';

interface ResponseData {
  msgID: number;
  text: string;
}

interface VerificationRequest {
  msgID: string | number;
  text: string;
}

export async function initializeRobotVerification(
  configLoader: () => Promise<EnvConfig>,
  aiClient: AIClient,
): Promise<void> {
  const config = await configLoader();

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

  // Handle the verification response with AI
  const systemMessage: ChatMessage = {
    role: 'system',
    content: robotVerificationSystemPrompt
      .replace('{{knowledge}}', robotVerificationKnowledge),
  };

  const userMessage: ChatMessage = {
    role: 'user',
    content: responseData.text,
  };

  const aiResponse = await aiClient.chat([systemMessage, userMessage]);

  // Send the AI response back to the verification endpoint
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
