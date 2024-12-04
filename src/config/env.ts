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
  openAiApiKey: string;
  openAiAudioModel: string;
  dalle3ApiKey: string;
  robotImageTaskUrl: string;
  robotImageTaskName: string;
  filesFromFactoryTaskUrl: string;
  filesFromFactoryTaskName: string;
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
    openAiApiKey: Deno.env.get('OPENAI_API_KEY'),
    openAiAudioModel: Deno.env.get('OPENAI_AUDIO_MODEL'),
    dalle3ApiKey: Deno.env.get('DALLE3_API_KEY'),
    robotImageTaskUrl: Deno.env.get('ROBOT_IMAGE_TASK_URL'),
    robotImageTaskName: Deno.env.get('ROBOT_IMAGE_TASK_NAME'),
    filesFromFactoryTaskUrl: Deno.env.get('FILES_FROM_FACTORY_TASK_URL'),
    filesFromFactoryTaskName: Deno.env.get('FILES_FROM_FACTORY_TASK_NAME'),
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
