# Deno AI Devs CLI

## About the Project

A command-line tool for AI Developer Course challenges, built with Deno and TypeScript. It helps automate solving various programming challenges by integrating with AI models through their APIs.

This is my project developed during the AI Devs 3 course in which I was a participant.

More about AI Devs 3 [here](https://www.aidevs.pl/).

This is entirely created by me and my AI assistants. 🤖🚀

This is my first project in Deno. Why? 🤔 For fun and learning. 🧠

## Available Use Cases

### solve-web-question

Fetches a question from a web page, processes it using AI, and submits the answer.

Usage:

```bash
deno run --allow-net --allow-env --allow-read src/main.ts solve-web-question <url>
```

Required environment variables:

- USERNAME
- PASSWORD
- ANTHROPIC_API_KEY
- AI_MODEL

## Project Structure

```text
src/
  ├── ai/              # AI client implementation
  ├── services/        # Shared services
  └── use-cases/       # Individual use cases
      └── solve-web-question/
```

## Development

This project uses:

- Deno 2
- TypeScript
- Test Driven Development
- Anthropic AI SDK

### Requirements

- Deno 2.0 or higher
- Internet connection
- Environment variables configured in `.env` file
- Required permissions:
  - `--allow-net` for network access
  - `--allow-env` for environment variables
  - `--allow-read` for .env file

### Running Tests

```bash
deno test --allow-net --allow-env --allow-read
```

### Error Handling

The application handles several types of errors:

- Missing or invalid arguments
- Network connection issues
- Missing environment variables
- HTML parsing errors
- Form submission errors
- AI processing errors

### Continuous Integration

The project uses GitHub Actions for continuous integration, which:

- Verifies code formatting
- Runs linter checks
- Executes all tests

The CI pipeline runs on every push to the main branch and on pull requests.

## Adding New Use Cases

1. Create a new directory under `src/use-cases/`
2. Implement the use case logic
3. Add the use case to the `useCases` object in `src/main.ts`
4. Update this README with usage instructions
5. Add corresponding tests

## License

MIT
