import { load } from 'https://deno.land/std@0.224.0/dotenv/mod.ts';

export interface EnvConfig {
  targetCompanyUrl: string;
  username: string;
  password: string;
  anthropicApiKey: string;
  aiModel: string;
  targetCompanyVerificationEndpoint: string;
  calibrationFileUrl: string;
  aiDevsApiKey: string;
  aiDevsVerificationUrl: string;
  censorshipTaskUrl: string;
  auditionsTaskMp3sUrl: string;
  auditionsTaskName: string;
}

export async function loadEnvConfig(): Promise<EnvConfig> {
  await load({ export: true });

  const requiredVars = {
    targetCompanyUrl: Deno.env.get('TARGET_COMPANY_URL'),
    username: Deno.env.get('USERNAME'),
    password: Deno.env.get('PASSWORD'),
    anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    aiModel: Deno.env.get('AI_MODEL'),
    targetCompanyVerificationEndpoint: Deno.env.get('TARGET_COMPANY_VERIFICATION_ENDPOINT'),
    calibrationFileUrl: Deno.env.get('CALIBRATION_FILE_URL'),
    aiDevsApiKey: Deno.env.get('AI_DEVS_API_KEY'),
    aiDevsVerificationUrl: Deno.env.get('AI_DEVS_VERIFICATION_URL'),
    censorshipTaskUrl: Deno.env.get('CENSORSHIP_TASK_URL'),
    auditionsTaskMp3sUrl: Deno.env.get('AUDITIONS_TASK_MP3S_URL'),
    auditionsTaskName: Deno.env.get('AUDITIONS_TASK_NAME'),
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  return requiredVars as EnvConfig;
}
