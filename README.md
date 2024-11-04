# Deno AI Devs CLI

A command-line tool to fetch and display web page content, with form submission capabilities and AI-powered question
answering.

This is my project developed during the AI Devs 3 course in which I was a participant.

More about AI Devs 3 [here](https://www.aidevs.pl/).

This is entirely created by me and my AI assistants. 🤖🚀

This is my first project in Deno. Why? 🤔 For fun and learning. 🧠

## Features

- Fetch web page content from provided URL
- Extract form questions and submit answers
- AI-powered question answering using Anthropic AI SDK (at the moment)
- Handle login forms with credentials from environment variables
- Error handling for invalid URLs and network issues

## Configuration

Create a `.env` file with your credentials:

```bash
USERNAME=your_username
PASSWORD=your_password
ANTHROPIC_API_KEY=your_anthropic_api_key
AI_MODEL=claude-3-5-haiku-20241022
```

## Usage

```bash
deno run --allow-net --allow-env --allow-read src/main.ts <url>
```

## Running Tests

```bash
deno test --allow-net --allow-env --allow-read
```

## Requirements

- Deno 2.0 or higher
- Internet connection
- Environment variables for credentials and AI configuration
- Required permissions:
  - `--allow-net` for network access
  - `--allow-env` for environment variables
  - `--allow-read` for .env file

## Architecture

The application is structured into several modules:

- `src/main.ts`: Main application logic
- `src/ai/client.ts`: AI client implementation using Vercel AI SDK
- `src/services/question_processor.ts`: Question processing service

## Error Handling

The application handles several types of errors:

- Missing URL argument
- Invalid URLs
- Network connection issues
- Missing environment variables
- Form parsing errors
- Form submission errors
- AI processing errors
- Invalid AI responses

## Development

This project follows Test Driven Development (TDD) practices. All new features should include corresponding tests.

### Continuous Integration

The project uses GitHub Actions for continuous integration, which:

- Verifies code formatting
- Runs linter checks
- Executes all tests with mocked external services

The CI pipeline runs on every push to the main branch and on pull requests.

## License

MIT
