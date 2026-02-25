# AGENTS.md — Arkan Project Guide

## Subagents — Delegate Tasks to Specialists

Rovo Dev has access to specialized subagents that should be used for relevant tasks. **Always delegate to a subagent when one matches the task** — they have deeper expertise, tighter focus, and produce better results than the general agent.

Subagent definitions live in `.rovodev/subagents/`. Use the `invoke_subagents` tool to call them.

### Available Subagents & When to Use Them

| Subagent | Use For in This Project |
|----------|------------------------|
| **Next.js 15 AI Development Assistant** | New pages/routes in `src/app/`, Server Components, data fetching, Next.js 15 App Router patterns, AI SDK integrations |
| **Next.js 15 Server Actions + Form Handling Master** | Forms with React Hook Form + Zod, Server Actions in `src/app/`, `useActionState`, progressive enhancement |
| **shadcn/ui Component Builder Assistant** | New components in `src/components/ui/`, extending Radix primitives, CVA variant systems, accessible UI patterns |
| **Animation + Motion Assistant** | Framer Motion animations, micro-interactions, Tailwind CSS animation utilities, reduced-motion support |
| **Data Table + Dashboard Master** | Admin dashboard tables (`src/components/admin/`), TanStack Table, Recharts charts, `src/app/admin/dashboard/` |
| **Next.js 15 Real-time & WebSocket Patterns Master** | SSE/WebSocket features, real-time notifications, live data feeds, `src/app/api/` streaming endpoints |
| **State Management with Redux Agent** | Complex Zustand store design (`useBuilderStore`, `useGenerationUIStore`), state architecture decisions |
| **Bug Hunter** | Investigating and reproducing bugs, writing detailed bug reports, analyzing error traces from `errors.txt` |
| **Code Review Checklist Agent** | Code quality reviews, security checks, consistency audits before merging |
| **AI Coding Best Practices Recommender Agent** | Refactoring guidance, design pattern improvements, general code quality analysis |
| **Async/Await Implementation Agent** | Refactoring async code in AI flows (`src/ai/flows/`), fixing unhandled promise patterns |
| **AI Software Scalability Advisor Agent** | RAG system scaling (`src/modules/rag/`), Qdrant performance, API route bottlenecks |

### Project-Specific Delegation Patterns

- **Adding a new writing tool**: Use **Next.js 15 AI Development Assistant** for the page (`src/app/writing-tools/<tool>/page.tsx`) + **shadcn/ui Component Builder Assistant** for the UI component (`src/components/writing-tools/`) + **Next.js 15 Server Actions + Form Handling Master** for the form logic.
- **Adding a new Genkit AI flow**: Use **Next.js 15 AI Development Assistant** (understands Server Actions and `'use server'` patterns in `src/ai/flows/`).
- **Admin dashboard features**: Use **Data Table + Dashboard Master** for tables/charts in `src/app/admin/` and `src/components/admin/`.
- **Fixing a reported bug**: Use **Bug Hunter** to reproduce and document, then the relevant specialist subagent to fix.
- **New shadcn/ui component**: Use **shadcn/ui Component Builder Assistant** — always extend existing primitives from `src/components/ui/` rather than rebuilding.
- **Real-time notifications or live updates**: Use **Next.js 15 Real-time & WebSocket Patterns Master** for SSE endpoints and `EventSource` client hooks.
- **Code review before merging**: Use **Code Review Checklist Agent** to audit security, consistency, and TypeScript correctness.

### Example: Invoking a Subagent

```
Use the "shadcn/ui Component Builder Assistant" subagent to build a new
FileUploadCard component in src/components/ui/ that accepts a file via
drag-and-drop, shows upload progress, and follows the existing shadcn/ui
patterns in this project (cn() utility, CVA variants, forwardRef).
```

---

## Project Overview

- **Name:** Arkan — AI-powered academic and professional writing platform
- **Language:** TypeScript (strict mode, 100% type safety goal)
- **Framework:** Next.js 15 (App Router, Server Actions, PWA via `@ducanh2912/next-pwa`)
- **React version:** React 18 (with strict mode enabled)
- **AI backend:** Google Genkit 1.x with Ollama models (Gemma 2B, Phi-3 Mini, Llama 3.1)
- **Database/Auth:** Firebase (Firestore, Authentication, Storage, FCM)
- **Vector store:** Qdrant (for RAG) via `@qdrant/js-client-rest`
- **UI library:** shadcn/ui (Radix UI primitives) + Tailwind CSS
- **State management:** Zustand (client store) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod validation
- **i18n:** i18next / react-i18next — supports Arabic (RTL) and English (LTR)
- **DI container:** tsyringe (decorator-based IoC)
- **Testing:** Jest + ts-jest + React Testing Library

---

## Key Scripts

```bash
npm run dev           # Start Next.js dev server (Turbopack, port 9002)
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # TypeScript type check (no emit)
npm run test          # Run Jest tests
npm run test:watch    # Jest in watch mode
npm run seed          # Seed local DB (tsx src/lib/db/seed.ts)

# Genkit AI dev server
npm run genkit:dev    # Start Genkit dev server
npm run genkit:watch  # Genkit dev server with file watching

# Qdrant vector store
npm run qdrant:start  # Start Qdrant via Docker Compose
npm run qdrant:stop   # Stop Qdrant
npm run qdrant:init   # Initialize Qdrant collections
npm run qdrant:stats  # Show Qdrant stats
```

---

## Directory Structure

- `src/app/` — Next.js App Router pages and API routes
  - `src/app/api/` — API route handlers (grouped by domain)
  - `src/app/admin/` — Admin-only pages (dashboard, user management, RAG monitor, etc.)
  - `src/app/writing-tools/` — Individual writing tool pages (23+ tools)
- `src/ai/` — All AI logic (Genkit flows, prompts, schemas, tools)
  - `src/ai/flows/` — Individual Genkit flow definitions (one file per flow)
  - `src/ai/prompts/` — Shared prompt templates
  - `src/ai/schemas/` — Zod schemas for all AI flow inputs/outputs
  - `src/ai/tools/` — Genkit tool definitions used by flows
  - `src/ai/genkit.ts` — Genkit instance + Ollama model config
- `src/modules/` — Domain modules following Clean Architecture (DDD)
  - Each module: `domain/`, `application/`, `adapters/`, `infrastructure/`
  - Modules: `admin`, `ai`, `ai-content`, `billing`, `projects`, `rag`, `templates`, `users`
- `src/components/` — React components (organized by feature/page)
  - `src/components/ui/` — Base shadcn/ui components
  - `src/components/shared/` — App-wide shared components
  - `src/components/writing-tools/` — Writing tool UI components
  - `src/components/report-mode/` — Report builder components
- `src/hooks/` — Custom React hooks (organized by domain)
- `src/context/` — React context providers (`AuthContext`, `LocalizationContext`)
- `src/infrastructure/` — Cross-cutting infrastructure (DI container, Firebase init)
- `src/lib/` — Utilities, types, and helper modules
  - `src/lib/utils/` — Utility functions (use `cn()` for Tailwind class merging)
  - `src/lib/query-keys.ts` — Centralized TanStack Query key factory
- `src/locales/` — Translation files (`en.json`, `ar.json`)
- `scripts/` — Standalone scripts for Qdrant migration, data loading, etc.

---

## Architecture Patterns

### Clean Architecture (Domain-Driven Design)

Each module in `src/modules/` follows the same four-layer structure:

1. **`domain/`** — Entities, repository interfaces, service interfaces (no framework deps)
2. **`application/`** — Use cases that orchestrate domain logic
3. **`adapters/`** — API clients (browser-facing) and controllers
4. **`infrastructure/`** — Firebase repository implementations, external service adapters

- Domain interfaces use token-based injection, e.g. `IUserRepositoryToken`
- Server-side implementations are registered in `src/infrastructure/di/container.ts` using `tsyringe`, conditionally on `typeof window === 'undefined'`
- Client API clients (like `UserApiClient`) are always registered and call internal Next.js API routes

### Dependency Injection

- Use `tsyringe` with `@injectable()` / `@inject()` decorators
- Register all implementations in `src/infrastructure/di/container.ts`
- Server-only repositories are `require()`-loaded inside the `typeof window === 'undefined'` guard to avoid client bundle contamination
- Resolve via `container.resolve(ClassName)` — do not `new` services directly

### AI Flows (Genkit)

- Each AI flow lives in its own file under `src/ai/flows/`
- All flow files must have `'use server';` at the top
- Define input/output Zod schemas in `src/ai/schemas/` and import from `@/ai/schemas`
- Use the pattern: define prompt → define flow → export async wrapper function
- Always handle errors with try/catch and throw descriptive `Error` objects
- Use `MODEL_BY_TASK` constants from `src/ai/genkit.ts` for consistent model selection:
  - `GEMMA_2B` — fast text generation, conversion tasks
  - `PHI3_MINI` — structured output, reports, analysis
  - `LLAMA3_8B` — complex academic/research tasks

### State Management

- **Zustand** (`useBuilderStore`, `useGenerationUIStore`) for complex client-side UI state
- **TanStack Query** for all server state, caching, and data fetching
- Use `src/lib/query-keys.ts` key factories for all `useQuery` / `useMutation` calls
- Never fetch data directly in components — always use hooks from `src/hooks/`

---

## Coding Conventions

### TypeScript

- Strict mode is enforced — zero type errors allowed (`npm run typecheck`)
- Use `type` keyword for type aliases; `interface` for object shapes with `extends`
- Prefer explicit return types on exported functions
- Use Zod for all runtime validation, especially for AI flow inputs/outputs and API payloads
- Avoid `any` — use `unknown` and narrow with type guards

### React / Next.js

- Default to **Server Components**; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Use `'use server'` for Server Actions and all Genkit flow files
- Use the `@/` path alias mapped to `src/` (defined in `tsconfig.json`)
- Event handler props should be named with the `handle` prefix: `handleClick`, `handleSubmit`
- Prefer `const` arrow functions over `function` declarations for components and handlers

### Styling

- Use Tailwind CSS utility classes exclusively — no CSS files or inline styles for new code
- Use the `cn()` utility from `@/lib/utils/cn` for conditional class merging (wraps `clsx` + `tailwind-merge`)
- Follow shadcn/ui patterns for component variants using `class-variance-authority` (CVA)
- RTL/LTR support is managed by `LanguageDirectionManager` — use logical CSS properties where possible

### Components

- Use `forwardRef` for all interactive/primitive components
- Extend shadcn/ui components rather than rebuilding from scratch
- Co-locate feature-specific hooks in `src/hooks/<feature>/`
- Barrel export files (`index.ts`) are used in key directories — add new exports there

### API Routes

- Place API routes under `src/app/api/<domain>/route.ts`
- Extract business logic into use cases in `src/modules/<domain>/application/use-cases/`
- Always validate request bodies server-side with Zod
- Return consistent JSON responses; use appropriate HTTP status codes

---

## Firebase & Security

- **Firestore rules** are in `firestore.rules` — always deny by default, whitelist explicitly
- User roles: `'admin'` and `'user'` — check role before any privileged operation
- User profile fields editable by users are explicitly allowlisted in Firestore rules
- Firebase Admin SDK is server-only — never import `firebase-admin` in client components
- Session management uses HTTP-only cookies set via `/api/auth/session`
- Server-side Firebase initialization is in `src/infrastructure/firebase/server-init.ts`
- Client-side Firebase is initialized in `src/firebase/` — use the provided `provider.tsx` hooks

---

## RAG System

- Vector store: Qdrant (default collection: `arkan_vectors`, dimension: 768)
- Embeddings: Ollama `nomic-embed-text` model
- RAG config is centralized in `src/modules/rag/infrastructure/config.ts`
- Switch between `memory` (development) and `qdrant` (production) via `VECTOR_STORE_PROVIDER` env var
- Admin document indexing UI at `/admin/document-indexer`
- RAG query tester at `/admin/rag-tester`
- Key env vars: `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION_NAME`, `OLLAMA_BASE_URL`, `OLLAMA_EMBEDDING_MODEL`

---

## Internationalization (i18n)

- Translation keys are in `src/locales/en.json` and `src/locales/ar.json`
- Arabic is RTL — the `LanguageDirectionManager` component handles `dir` attribute on `<html>`
- Use `react-i18next`'s `useTranslation()` hook in client components
- Custom fonts are loaded per language to ensure proper Arabic rendering

---

## Testing

- Test files live alongside source code in `__tests__/` subdirectories
- AI flow tests: `src/ai/flows/__tests__/`
- Hook tests: `src/hooks/core/__tests__/`
- RAG tests: `src/modules/rag/infrastructure/__tests__/`
- Use `jest.config.js` aliases — import from `@/lib/`, `@/ai/`, `@/components/`, `@/hooks/`
- Mocking: use `jest-fetch-mock` for fetch; mock Firebase with manual mocks
- Run type checking before tests: `npm run typecheck && npm test`

---

## Important Files

| File | Purpose |
|------|---------|
| `src/ai/genkit.ts` | Genkit instance, Ollama model constants, `MODEL_BY_TASK` |
| `src/ai/schemas/index.ts` | Central barrel export for all AI Zod schemas |
| `src/ai/flows/index.ts` | Barrel export for all AI flows |
| `src/infrastructure/di/container.ts` | tsyringe DI registrations (client + server) |
| `src/lib/query-keys.ts` | TanStack Query key factory |
| `src/lib/utils/cn.ts` | Tailwind class merging utility |
| `src/lib/types.ts` | Shared application-level TypeScript types |
| `src/context/AuthContext.tsx` | Auth state, Firebase user, user profile context |
| `firestore.rules` | Firestore security rules |
| `firebase.json` | Firebase project configuration |
| `docker-compose.yml` | Qdrant local development setup |
| `src/modules/rag/infrastructure/config.ts` | RAG/Qdrant/Ollama configuration |

---

## Environment Variables (key ones)

```
# AI / Ollama
OLLAMA_BASE_URL=http://185.190.140.93:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Qdrant
VECTOR_STORE_PROVIDER=qdrant   # or 'memory' for dev
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=arkan_vectors
EMBEDDING_DIMENSION=768

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

## Common Pitfalls

- Do not import `firebase-admin` or any server-only module in client components or hooks
- Do not use `new` to instantiate services — always resolve via `container.resolve()`
- All Genkit flow files must declare `'use server'` at the top
- Server-only DI registrations must be inside the `typeof window === 'undefined'` guard in `container.ts`
- When adding new TanStack Query data fetches, always add a key factory to `src/lib/query-keys.ts`
- Credits are deducted server-side only — never trust client-side credit values
- RTL/LTR layout changes must be tested in both Arabic and English
