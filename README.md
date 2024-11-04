# Web Page Fetcher CLI

A command-line tool to fetch and display web page content.

## Features

- Fetch web page content from provided URL
- Display HTML content maintaining page structure
- Error handling for invalid URLs and network issues

## Usage

```bash
deno run --allow-net main.ts <url>
```

Example:

```bash
deno run --allow-net main.ts https://example.com
```

## Running Tests

To run the tests:

```bash
deno test --allow-net
```

## Requirements

- Deno 2.0 or higher
- Internet connection
- `--allow-net` permission for network access

## Error Handling

The application handles several types of errors:
- Missing URL argument
- Invalid URLs
- Network connection issues
- Non-200 HTTP responses

## Development

This project follows Test Driven Development (TDD) practices. All new features should include corresponding tests in the `main_test.ts` file.

## License

MIT