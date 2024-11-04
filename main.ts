import { load } from "https://deno.land/std/dotenv/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

interface LoginCredentials {
  username: string;
  password: string;
  answer: number;
}

export async function fetchWebPage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw error;
  }
}

export function extractQuestion(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  if (!document) throw new Error("Failed to parse HTML");
  
  const questionElement = document.querySelector("#human-question");
  if (!questionElement) throw new Error("Question element not found");
  
  return questionElement.textContent;
}

export async function submitLoginForm(url: string, credentials: LoginCredentials): Promise<string> {
  const formData = new FormData();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  formData.append("answer", credentials.answer.toString());

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

async function getCredentials(): Promise<{ username: string; password: string }> {
  await load({ export: true });
  
  const username = Deno.env.get("USERNAME");
  const password = Deno.env.get("PASSWORD");
  
  if (!username || !password) {
    throw new Error("USERNAME and PASSWORD environment variables must be set");
  }
  
  return { username, password };
}

async function main() {
  const url = Deno.args[0];
  
  if (!url) {
    console.error('Please provide a URL as an argument');
    console.error('Usage: deno run --allow-net --allow-env --allow-read main.ts <url>');
    Deno.exit(1);
  }

  try {
    // First fetch to get the question
    const html = await fetchWebPage(url);
    const question = extractQuestion(html);
    console.log("Question:", question);

    // Generate random answer (you might want to implement proper logic here)
    const answer = Math.floor(Math.random() * 100);
    console.log("Generated answer:", answer);

    // Get credentials from environment
    const { username, password } = await getCredentials();

    // Submit the form
    const response = await submitLoginForm(url, {
      username,
      password,
      answer,
    });

    console.log("Response:", response);
  } catch (error) {
    console.error('Operation failed:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
