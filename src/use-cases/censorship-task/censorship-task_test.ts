import { assertRejects } from 'https://deno.land/std@0.224.0/assert/assert_rejects.ts';
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { stub } from 'https://deno.land/std@0.224.0/testing/mock.ts';
import { censorshipTask } from './censorship-task.ts';
import { getMockAiClient, getMockEnvConfig, getMockVerificationClient } from '../../test/test-utils.ts';
import { VerificationApiClient, VerificationApiResponse } from '../../clients/verification-api-client.ts';
import { AnthropicClient, ChatMessage, ChatOptions } from '../../ai-clients/anthropic-ai-chat-client.ts';

const mockConfig = getMockEnvConfig();
const mockAiClient = getMockAiClient();
const mockVerificationClient = getMockVerificationClient();

Deno.test({
  name: 'censorshipTask - should successfully process and verify censored text',
  fn: async () => {
    const fetchStub = stub(globalThis, 'fetch', () => Promise.resolve(new Response('text to censor')));

    try {
      const chatStub = stub(
        mockAiClient as AnthropicClient,
        'chat',
        function (
          this: AnthropicClient,
          _payload: { systemPrompt: string; messages: ChatMessage[]; options?: ChatOptions },
        ) {
          return Promise.resolve('censored text');
        },
      );

      const verifyStub = stub(
        mockVerificationClient as VerificationApiClient,
        'verify',
        function (this: VerificationApiClient, _taskName: string, _answer: unknown): Promise<VerificationApiResponse> {
          return Promise.resolve({ code: 0, message: 'success' });
        },
      );

      await censorshipTask(mockConfig, mockAiClient, mockVerificationClient);

      const aiCalls = chatStub.calls;
      assertEquals(aiCalls.length, 1);
      console.log(aiCalls[0].args[0]);
      assertEquals(aiCalls[0].args[0].messages[0].content, 'text to censor');

      const verificationCalls = verifyStub.calls;
      assertEquals(verificationCalls.length, 1);
      assertEquals(verificationCalls[0].args[0], 'CENZURA');
      assertEquals(verificationCalls[0].args[1], 'censored text');
    } finally {
      fetchStub.restore();
    }
  },
});

Deno.test({
  name: 'censorshipTask - should throw error when fetch fails',
  fn: async () => {
    const fetchStub = stub(globalThis, 'fetch', () => Promise.resolve(new Response('Error', { status: 500 })));

    try {
      await assertRejects(
        () => censorshipTask(mockConfig, mockAiClient, mockVerificationClient),
        Error,
        'Failed to fetch censorship task',
      );
    } finally {
      fetchStub.restore();
    }
  },
});
