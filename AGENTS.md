# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router UI — `components/`, `editor/`, `canvas/`, `audio/`, `telemetry/`, `save/`, and `(routes)/`.
- `core/`: Domain and runtime — `engine/`, `blocks/`, `infra/`. Imports flow one-way: `core → app`.
- `content/`: Curriculum assets — `lessons/*.json` (validated) and `voice/` strings.
- `test/`: Vitest specs (`*.spec.ts`).
- `scripts/`: Utility scripts (e.g., `lintLesson.ts`).
- `docs/`: Engineering conventions and architecture references.
- Aliases: `@core/*`, `@app/*`, `@content/*` (see `tsconfig.json`). Example: `import { LessonSchema } from '@core/blocks/schemas';`.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server.
- `npm run build`: Production build.
- `npm start`: Serve built app.
- `npm test`: Run Vitest suite.
- `npm run lint`: ESLint (includes import order and hooks rules).
- `npm run format`: Prettier write.
- `npm run schema:check`: Validate `content/lessons/*.json` via Zod.

## Coding Style & Naming Conventions
- TypeScript strict; React 18. Indent 2 spaces (`.editorconfig`).
- Prettier: `printWidth 100`, `semi true`, `singleQuote false`.
- ESLint: `@typescript-eslint`, `react`, `react-hooks`, `import/order` (alphabetized, spaced).
- Naming: UI components `PascalCase.tsx`; logic/utilities `kebab-case.ts`.
- Patterns: Prefer `undefined` over `null`; validate external input with Zod; centralize state in a single `zustand` store; animate Canvas with `requestAnimationFrame`.

## Testing Guidelines
- Frameworks: `vitest` + `@testing-library/react`.
- Location: `test/*.spec.ts`. Example: `editor-store.spec.ts`, `schemas.spec.ts`.
- Scope: Prioritize core VM/blocks, schema validation, and key UI flows. Keep tests deterministic (avoid raw Canvas rendering; test logic functions instead).
- Run: `npm test` (CI also runs tests and lesson schema checks).

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). Example: `feat(editor): highlight active block`.
- PRs: One purpose per PR. Include description, linked issues, screenshots/GIFs for UI, and verification steps. Ensure `lint`, `test`, and `schema:check` pass.
- CI: GitHub Actions runs lint, tests, and lesson schema validation on pushes/PRs.

## Security & Configuration Tips
- Keep user-facing strings in `content/voice/`; avoid UI literals.
- Validate lessons with `LessonSchema` before use. Avoid `!` non-null assertions; use guards.
- Do not introduce `app → core` imports; maintain clean boundaries.

