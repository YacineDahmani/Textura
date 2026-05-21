# Textura

Textura is a developer-first text workbench for fast text transformation, formatting, encoding, hashing, and inspection. It is designed to feel lightweight and focused: paste input, pick a tool, and get an immediate result.

## What Textura Does

Textura gives you a single workspace for many text utilities. It preserves state per tool, so switching between tools keeps each tool's input and output intact, whether you paste content directly or upload a supported file.

The experience centers on:

- Fast transformations with immediate feedback.
- A split-pane workspace for input and output.
- A compact technical UI with minimal chrome.
- A theme switcher for quick visual preference changes.
- Keyboard shortcuts, history, copy, swap, and tool switching.
- File upload support for supported text, document, and code formats.
- Export buttons for saving generated output as files.
- Clear separation between local browser-side tools and backend-backed tools.

### Tool Set

Textura is designed around three main families of tools.

#### Text Tools

- Case Converter: uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, and PascalCase.
- Text Cleaner: trim text, remove blank lines, deduplicate lines, collapse spaces, strip HTML, normalize Unicode, and handle multilingual text more predictably.
- Text Stats: live counts for characters, words, lines, paragraphs, sentences, reading time, and related diagnostics across different writing systems.

#### Format Tools

- JSON Formatter: pretty-print, minify, and optional key sorting.
- Code Minifier: minify HTML, CSS, and JavaScript with mode-specific options.
- Diff Viewer: compare two text inputs and inspect the differences.
- Regex Tester: test patterns, flags, replacements, matches, and results.

#### Encode Tools

- Base64 Tool: encode and decode text, including URL-safe support.
- URL Encoder: encode and decode URI text.
- Hash Generator: generate multiple hashes from the same input.

#### Export Support

- Most text-oriented tools can export the current output as `.txt`, `.doc`, or `.docx`.
- JSON Formatter exports formatted JSON directly as a `.json` file.
- Minifier exports raw minified `.html`, `.css`, or `.js` files depending on the selected mode.

## Tech Stack

### Frontend

- React
- Vite
- Zustand for state management
- Lucide React for icons
- diff for diff rendering
- Tailwind CSS v4 with a small global token layer

### Backend

- FastAPI
- Uvicorn
- Pydantic for validation
- CORS enabled for local development

## Setup

### Backend

From the backend folder, run:

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

From the frontend folder, run:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

The app expects the backend at http://localhost:8000 and the frontend at http://localhost:5173.
