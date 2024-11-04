import { assertEquals } from "https://deno.land/std/assert/assert_equals.ts";
import { spy } from "https://deno.land/std/testing/mock.ts";
import { AIClient } from "../ai/client.ts";
import { processQuestion } from "./question_processor.ts";

Deno.test("processQuestion - extracts number from AI response", async () => {
  const mockChat = spy(() => Promise.resolve("The answer is 42"));
  const mockAIClient = {
    chat: mockChat,
  } as unknown as AIClient;

  const result = await processQuestion("What is 6 * 7?", mockAIClient);
  assertEquals(result, 42);
});

Deno.test("processQuestion - handles non-numeric response", async () => {
  const mockChat = spy(() => Promise.resolve("The answer is forty-two"));
  const mockAIClient = {
    chat: mockChat,
  } as unknown as AIClient;

  await processQuestion("What is six times seven?", mockAIClient)
    .then(() => {
      throw new Error("Should have thrown an error");
    })
    .catch((error) => {
      assertEquals(error.message, "Could not extract a valid number from AI response");
    });
}); 