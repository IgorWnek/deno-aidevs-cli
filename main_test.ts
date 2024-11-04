import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { stub } from "https://deno.land/std/testing/mock.ts";

Deno.test("fetchWebPage - successful fetch", async () => {
  const testHtml = "<html><body>Test content</body></html>";
  const fetchStub = stub(globalThis, "fetch", () =>
    Promise.resolve(new Response(testHtml, { status: 200 }))
  );

  try {
    const { fetchWebPage } = await import("./main.ts");
    const result = await fetchWebPage("https://example.com");
    assertEquals(result, testHtml);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("fetchWebPage - failed fetch", async () => {
  const fetchStub = stub(globalThis, "fetch", () =>
    Promise.resolve(new Response(null, { status: 404 }))
  );

  try {
    const { fetchWebPage } = await import("./main.ts");
    await assertRejects(
      async () => await fetchWebPage("https://example.com"),
      Error,
      "HTTP error! status: 404"
    );
  } finally {
    fetchStub.restore();
  }
});
