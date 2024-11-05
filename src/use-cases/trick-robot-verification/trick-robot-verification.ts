import { loadEnvConfig, type EnvConfig } from '../../config/env.ts';

interface VerificationRequest {
  msgID: string;
  text: string;
}

export async function initializeRobotVerification(
  configLoader: () => Promise<EnvConfig> = loadEnvConfig
): Promise<void> {
  try {
    const config = await configLoader();
    const verificationUrl = config.targetCompanyVerificationEndpoint;

    const initialRequest: VerificationRequest = {
      msgID: '0',
      text: 'READY',
    };

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Verification Response:', JSON.stringify(responseData));
  } catch (error) {
    console.error('Robot verification failed:', error);
    throw error;
  }
}
