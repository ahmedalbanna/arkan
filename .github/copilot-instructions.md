## Quick orienting notes for AI coding agents

This repo is a Next.js app (app-router) with a Genkit-based AI subsystem under `src/ai/` and Firebase as the backend. Keep instructions short, actionable, and limited to repository-discoverable patterns.

- Key entry points:
  - Frontend: `src/app/` (Next.js app directory). Server components and API routes follow the app-router layout.
  - AI subsystem: `src/ai/` (see `src/ai/README.md`). Genkit flows live in `src/ai/flows/`, prompts in `src/ai/prompts/`, models in `src/ai/config/models.ts`, and Zod schemas in `src/ai/schemas/`.
  - Services: `src/services/` (e.g., `generation-service.ts` logs to Firestore via `adminDb`).
  - Helpers and DB: `src/lib/` (database seeds under `src/lib/db/`).

- Local developer commands (discoverable in `package.json`):
  - Run dev Next.js: `npm run dev` (uses turbopack, port 9002).
  - Genkit dev flows: `npm run genkit:dev` or `npm run genkit:watch` (runs `src/ai/dev.ts`).
  - Typecheck: `npm run typecheck` (runs `tsc --noEmit`).
  - Tests: `npm test` (Jest).
  - DB seeds: `npm run seed:firestore` and other `seed:*` scripts under `package.json`.

- AI subsystem conventions (follow exactly):
  - Schema-first: define Zod schemas in `src/ai/schemas/` and use them in prompts/flows. The schemas define the contract for input and exact output format.
  - Prompts are pure definitions in `src/ai/prompts/` via `ai.definePrompt(...)` — keep them isolated from orchestration logic.
  - Flows live in `src/ai/flows/` and act as lightweight orchestrators: import a model from `src/ai/config/models.ts`, import a prompt, call the model, validate with Zod, and return typed results.
  - Tools (external helpers) belong in `src/ai/tools/` and should be called from flows when necessary (e.g., fetch external data, call a DB).
  - When adding a new AI feature follow the pattern in `src/ai/README.md`: schema → prompt → flow → API route → UI hook/page.

- Project patterns and gotchas to respect:
  - App-router file locations matter: add API endpoints under `src/app/api/` to be available as server actions.
  - Server-only code uses server runtimes (see `generation-service.ts` with `'use server'`): do not import browser-only modules there.
  - Logging and durable writes use `adminDb` from `src/lib/firebase/server-init` — prefer this for server-side Firestore writes.
  - Genkit is integrated (`genkit`, `genkit-cli`, `@genkit-ai/*`) — use `npm run genkit:dev` for iterating on flows locally.
  - Zod schemas are authoritative: avoid returning free-form objects where a schema exists.

- Files worth opening first when editing features:
  - `src/ai/README.md` — architecture and workflow overview.
  - `src/ai/config/models.ts` — configured model choices.
  - An example flow/prompt pair in `src/ai/flows/` and `src/ai/prompts/`.
  - `src/services/generation-service.ts` — how generations are logged to Firestore (non-fatal on errors).
  - `src/context/AuthContext.tsx` and `src/context/LocalizationContext.tsx` — auth/localization interactions.

- Examples to follow (concrete):
  - To add a generator endpoint: create `src/ai/schemas/myFeature.ts` (Zod schemas), `src/ai/prompts/myFeaturePrompt.ts` (ai.definePrompt), `src/ai/flows/myFeatureFlow.ts` (ai.defineFlow), then an API handler under `src/app/api/my-feature/route.ts` that calls the flow.
  - To run prompts locally while iterating, use `npm run genkit:watch` and modify files under `src/ai/`.

- When in doubt:
  - Prefer existing patterns in `src/ai/` and match naming/exports.
  - Keep prompts free of I/O and side effects; keep flows thin and orchestrating.
  - Use Zod to validate outputs before returning to callers; failures should be surfaced for debugging but handled gracefully in production paths.

If anything above seems incomplete or you want explicit examples added (file-level snippets or flow examples), tell me which part to expand. 
