# Web Page Fetcher CLI

A command-line tool to fetch and display web page content, with form submission capabilities.

## Features

- Fetch web page content from provided URL
- Extract form questions and submit answers
- Handle login forms with credentials from environment variables
- Error handling for invalid URLs and network issues

## Usage

First, create a `.env` file with your credentials:

```bash
USERNAME=your_username
PASSWORD=your_password
```

Then run the application:

```bash
deno run --allow-net --allow-env --allow-read main.ts <url>
```

Example:

```bash
deno run --allow-net --allow-env --allow-read main.ts https://example.com
```

## Running Tests

To run the tests:

```bash
deno test --allow-net --allow-env --allow-read
```

## Requirements

- Deno 2.0 or higher
- Internet connection
- Environment variables for credentials
- Required permissions:
  - `--allow-net` for network access
  - `--allow-env` for environment variables
  - `--allow-read` for .env file

## Error Handling

The application handles several types of errors:

- Missing URL argument
- Invalid URLs
- Network connection issues
- Missing environment variables
- Form parsing errors
- Form submission errors

## Development

This project follows Test Driven Development (TDD) practices. All new features should include corresponding tests in the `main_test.ts` file.

## License

MIT
