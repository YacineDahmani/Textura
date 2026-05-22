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
- **Backend Connectivity & Health Monitoring**: Periodic API health polling dynamically updates a status badge in the TopBar and triggers inline error banners on remote tools for graceful offline degradation.

### Tool Set

Textura is designed around three main families of tools, separated by visual group dividers in the navigation sidebar:

#### Text Tools
- **Case Converter**: Convert between uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, and PascalCase.
- **Text Cleaner**: Trim text, remove blank lines, deduplicate lines, collapse spaces, strip HTML, normalize Unicode, and handle multilingual text more predictably.
- **Text Stats**: Live counts for characters, words, lines, paragraphs, sentences, reading time, and related diagnostics across different writing systems.

#### Format Tools
- **JSON Formatter**: Pretty-print (2 or 4 spaces), minify, and optional key sorting.
- **Markdown Preview**: High-fidelity compiler offering double-pane Live Interactive Preview or copyable raw HTML code. Perfectly styled with custom typography conforming to Satoshi light/dark aesthetics.
- **XML/YAML Formatter**: Clean native DOM formatting and indentation control (2 or 4 spaces) for XML and YAML, XML minification, and in-gutter syntax error detection that pinpoints exact line failures.
- **Code Minifier**: Minify HTML, CSS, and JavaScript with mode-specific options.
- **Diff Viewer**: Compare two text inputs and inspect the differences.
- **Regex Tester**: Test patterns, flags, replacements, matches, and results in real time.

#### Encode Tools
- **Password Generator & Strength Checker**: Generate cryptographically secure passwords (`window.crypto.getRandomValues`) with customizable lengths, character pools (uppercase, lowercase, numbers, symbols), and quantity. Evaluate passwords using an entropy calculation metric ($E = L \times \log_2(R)$), custom checklists, and a glowing, color-coded visual strength meter.
- **Base64 Tool**: Encode and decode text, including URL-safe support.
- **URL Encoder**: Encode and decode URI text.
- **Hash Generator**: Generate multiple cryptographic digests (MD5, SHA-1, SHA-256, SHA-512) simultaneously from a single input.

## Tech Stack

### Frontend
- **React & Vite**
- **Zustand** for state management
- **Lucide React** for icons
- **diff** for client-side diff rendering
- **Tailwind CSS v4** with a sleek, HSL-tailored global theme layer (light/dark modes)

### Backend
- **FastAPI** & **Uvicorn**
- **Pydantic** for rigid request schema parsing and input length constraints (limited to 500,000 characters for DoS/resource protection)
- **slowapi** rate-limiting middleware to protect computationally intensive hashing, regex, and file parsing routes
- **python-dotenv** environment configuration supporting multi-domain dynamic CORS (`ALLOWED_ORIGIN` in `.env`)
- Centralized testing configuration under a dedicated `/tests` subdirectory

## Setup

### Backend Setup
1. Create a local environment file `backend/.env` based on `backend/.env.example`:
   ```bash
   ALLOWED_ORIGIN=http://localhost:5173
   ```
2. Run the FastAPI development server:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Install dependencies and start the Vite dev server:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0
   ```

The app expects the FastAPI backend at `http://localhost:8000` and the frontend at `http://localhost:5173`.
