# Slide Palette Companion

Static web app built with Vite and TypeScript to help presentation designers discover complementary color palettes for slide decks using the Gemini API.

## Prerequisites

- Node.js 18+
- Gemini API key with access to `gemini-2.5-flash`

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set VITE_GEMINI_API_KEY
```

## Development

- `npm run dev` – start Vite dev server at `http://localhost:5173`
- `npm run build` – type-check and create production bundle
- `npm run preview` – preview built assets locally

## Usage

1. Start the dev server.
2. Pick a base color with the color picker or enter a hex value.
3. Submit to request five complementary colors with suggested slide roles and rationale.

The UI will surface any API errors in the status area below the form.
