import { assertRejects } from 'https://deno.land/std@0.224.0/assert/assert_rejects.ts';
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { stub } from 'https://deno.land/std@0.224.0/testing/mock.ts';
import { censorshipTask } from './censorship-task.ts';
import { getMockAiClient, getMockEnvConfig, getMockVerificationClient } from '../../test/test-utils.ts';
import { AiChatClient, ChatMessage } from '../../ai-clients/ai-chat-client.ts';
import { VerificationApiClient, VerificationApiResponse } from '../../clients/verification-api-client.ts';

const mockConfig = getMockEnvConfig();
const mockAiClient = getMockAiClient();
const mockVerificationClient = getMockVerificationClient();

Deno.test({
  name: 'censorshipTask - should successfully process and verify censored text',
  fn: async () => {
    const fetchStub = stub(globalThis, 'fetch', () => Promise.resolve(new Response('text to censor')));

    try {
      // Mock AI client response with proper typing
      const chatStub = stub(
        mockAiClient as AiChatClient,
        'chat',
        function (this: AiChatClient, _messages: ChatMessage[]) {
          return Promise.resolve('censored text');
        },
      );

      // Mock verification client response with proper typing
      const verifyStub = stub(
        mockVerificationClient as VerificationApiClient,
        'verify',
        function (this: VerificationApiClient, _taskName: string, _answer: unknown): Promise<VerificationApiResponse> {
          return Promise.resolve({ code: 0, message: 'success' });
        },
      );

      await censorshipTask(mockConfig, mockAiClient, mockVerificationClient);

      // Verify that all mocks were called with correct arguments
      const aiCalls = chatStub.calls;
      assertEquals(aiCalls.length, 1);
      assertEquals(aiCalls[0].args[0][1].content, 'text to censor');

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
