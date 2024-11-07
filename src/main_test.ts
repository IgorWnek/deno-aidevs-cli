import { assertRejects } from "https://deno.land/std/assert/mod.ts";
import { main, UseCaseError } from "./main.ts";
import { withMockedEnv } from "./test/test-utils.ts";

Deno.test({
  name: "main - no use case specified",
  fn: withMockedEnv(async () => {
    const originalArgs = Deno.args;
    try {
      (Deno.args as string[]) = [];
      await assertRejects(
        async () => await main(),
        UseCaseError
      );
    } finally {
      (Deno.args as string[]) = originalArgs;
    }
  }),
});

Deno.test({
  name: "main - invalid use case",
  fn: withMockedEnv(async () => {
    const originalArgs = Deno.args;
    try {
      (Deno.args as string[]) = ["invalid-use-case"];
      await assertRejects(
        async () => await main(),
        UseCaseError
      );
    } finally {
      (Deno.args as string[]) = originalArgs;
    }
  }),
});
