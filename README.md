# Deno AI Devs CLI

## About the Project

A command-line tool for AI Developer Course challenges, built with Deno and TypeScript. It helps automate solving various programming challenges by integrating with AI models through their APIs.

This is my project developed during the AI Devs 3 course in which I was a participant.

More about AI Devs 3 [here](https://www.aidevs.pl/).

This is entirely created by me and my AI assistants. 🤖🚀

This is my first project in Deno. Why? 🤔 For fun and learning. 🧠

## Available Use Cases

1. **Trick Robot Verification** - Helps bypass robot verification challenges
2. **Solve Web Question** - Assists in solving web-based questions
3. **Calibration File Fix** - Processes and fixes calibration files by evaluating mathematical expressions and handling test cases
4. **Censorship Task** - Processes text content and applies censorship rules using AI
5. **Auditions Task** - Processes audio recordings, transcribes them, and analyzes content using AI

Usage:

```bash
deno run --allow-net --allow-env --allow-read src/main.ts solve-web-question <url>
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts calibration-file-fix
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts censorship-task
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts auditions-task
```

### Robot Verification

This use case includes a robot verification mechanism that communicates with a verification endpoint.

It allows the system to handle robot verification challenges by:

1. Processing incoming verification questions
2. Using AI to generate responses based on specific knowledge
3. Sending back verification responses

To use it run:

```bash
deno run --allow-net --allow-env --allow-read src/main.ts solve-web-question <url>
```

The system handles verification requests in JSON format:

### Auditions Task

The application includes functionality to process audio recordings and analyze their content.

What this use case does:

1. Downloads and processes audio files from a ZIP archive
2. Transcribes audio using OpenAI's audio model
3. Caches transcriptions as text files for future use
4. Analyzes transcriptions using AI to extract specific information
5. Verifies results with the AI Devs API

Run this use case:

```bash
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts auditions-task
```

### Article Analyser

Run this use case:

```bash
deno run --allow-net --allow-env --allow-read --allow-write src/main.ts article-analyser -asa
```

There are options available:

- `-asa` - Archive scraped article

## Project Structure

TBD at the later point

## Development

This project uses:

- Deno 2
- TypeScript
- Test Driven Development
- Anthropic AI SDK
- official OpenAI REST API

### Environment Variables

The application requires the following environment variables to be set:

- `USERNAME` - Username for authentication
- `PASSWORD` - Password for authentication
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `AI_MODEL` - The AI model to use
- `TARGET_COMPANY_URL` - The target URL for web questions
- `TARGET_COMPANY_VERIFICATION_ENDPOINT` - The complete URL for the verification endpoint
- `CALIBRATION_FILE_URL` - URL to download the calibration file from
- `AI_DEVS_API_KEY` - API key for AI Devs verification
- `AI_DEVS_VERIFICATION_URL` - The complete URL for the verification endpoint
- `CENSORSHIP_TASK_URL` - The complete URL for the censorship task endpoint
- `AUDITIONS_TASK_MP3S_URL` - URL to download the ZIP file containing audio recordings
- `AUDITIONS_TASK_NAME` - Task name for verification
- `OPENAI_API_KEY` - Your OpenAI API key for audio transcription
- `OPENAI_AUDIO_MODEL` - OpenAI model to use for audio transcription

To set up your environment:

Create a `.env` file in the root directory with these variables.

### Requirements

- Deno 2.0 or higher
- Internet connection
- Environment variables configured in `.env` file
- Required permissions:
  - `--allow-net` for network access
  - `--allow-env` for environment variables
  - `--allow-read` for .env file
  - `--allow-write` for creation and writing new files

### Running Tests

```bash
deno test --allow-net --allow-env --allow-read --allow-write
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
