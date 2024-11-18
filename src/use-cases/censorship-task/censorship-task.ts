import { EnvConfig } from '../../config/env.ts';
import { AiClient } from '../../ai/client.ts';
import { VerificationApiClient } from '../../clients/verification-api-client.ts';
import { censorshipPrompt } from '../../prompts/censorship-prompt.ts';

export async function censorshipTask(
  config: EnvConfig,
  aiClient: AiClient,
  verificationClient: VerificationApiClient,
): Promise<void> {
  const response = await fetch(config.censorshipTaskUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch censorship task: ${response.statusText}`);
  }

  const textToCensor = await response.text();
  console.log('Original text:', textToCensor);

  const censoredText = await aiClient.chat([
    { role: 'system', content: censorshipPrompt },
    { role: 'user', content: textToCensor },
  ]);

  console.log('Censored text:', censoredText);

  const result = await verificationClient.verify('CENZURA', censoredText);
  console.log(`Verification result: \ncode: ${result.code}\nmessage: ${result.message}`);
}