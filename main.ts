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

async function main() {
  const url = Deno.args[0];
  
  if (!url) {
    console.error('Please provide a URL as an argument');
    console.error('Usage: deno run --allow-net main.ts <url>');
    Deno.exit(1);
  }

  try {
    const html = await fetchWebPage(url);
    console.log(html);
  } catch (error) {
    console.error('Failed to fetch the webpage:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
