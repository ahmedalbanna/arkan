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
- **Database/Auth:** SQLite (Drizzle ORM) for data and local auth; Firebase Admin SDK (server-side only) for legacy support and FCM.
- **File Storage:** Local filesystem-based storage (`storage/uploads/`).
- **Vector store:** Qdrant (for RAG) via `@qdrant/js-client-rest`.
- **No Client-side Firebase**: The project is fully independent of client-side Firebase SDKs. Authentication is local (SQLite + JWT), and files are served locally. Do not re-introduce `firebase/auth`, `firebase/app`, or `firebase/firestore` in client components.
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
- `src/modules/` — Domain modules following Clean Architecture (DDD)
  - Each module: `domain/`, `application/`, `adapters/`, `infrastructure/`
  - **`domain/schemas/`**: High-level flow input/output Zod schemas.
  - **`infrastructure/flows/`**: Genkit flow definitions, categorized by type (academic, writing, media, etc.).
  - **`infrastructure/prompts/`**: AI prompt templates.
  - **`infrastructure/tools/`**: Genkit tool definitions and a `schemas.ts` for tool-specific structures.
  - **`infrastructure/services/Genkit.ts`**: The shared Genkit instance and model configuration.
  - Each module: `domain/`, `application/`, `adapters/`, `infrastructure/`
  - **`domain/schemas/`**: Module-specific Zod schemas (moved from `src/lib/schemas/`)
  - **`adapters/hooks/`**: Feature-specific hooks (moved from `src/hooks/data/`)
  - **`adapters/components/`**: "Smart" components containing logic and hooks
  - **`adapters/state/`**: Localized state management (Zustand stores) for the module
  - **`infrastructure/utils/`**: Module-specific infrastructure utilities (e.g., pdf-utils)
  - Modules: `admin`, `ai`, `ai-content`, `billing`, `projects`, `rag`, `templates`, `users`
- `src/components/` — Pure/Shared React components
  - `src/components/ui/` — Base shadcn/ui components (stateless Radix primitives)
  - `src/components/shared/` — App-wide UI (Header, ThemeToggle, AppProviders)
- `src/hooks/` — Generic utility hooks
  - `src/hooks/util/` — Non-domain hooks (`use-service`, `use-toast`, `use-mobile`)
- `src/context/` — React context providers (`AuthContext`, `LocalizationContext`)
- `src/infrastructure/` — Cross-cutting infrastructure
  - **`infrastructure/api/`**: `ApiService.ts`, `api-utils.ts`, `query-keys.ts`, `errorUtils.ts`
  - **`infrastructure/cache/`**: `BrowserCache.ts` (moved from `src/lib/utils/cache.ts`)
  - **`infrastructure/utils/`**: Foundational utilities (`cn`, `result`, `randomId`, `types.ts`)
  - **`infrastructure/security/`**: `rate-limiter.ts`, `fingerprint.ts`, `location.ts`
  - **`infrastructure/db/`**: SQLite database, schema, and seeding logic
  - **`infrastructure/i18n/`**: Translation and localization logic
  - **`infrastructure/config/`**: Global application configuration
  - **`infrastructure/di/`**: Dependency Injection container configuration
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
- **React Components**: Use the `useService(token)` hook from `@/hooks/util/use-service` to resolve dependencies within components. This ensures proper memoization and DI access in the client.
- Resolve via `container.resolve(ClassName)` — do not `new` services directly
- In Next.js route handlers, prefer resolving controllers/use cases through the DI container once metadata is set up correctly; avoid falling back to ad-hoc manual wiring unless there is a proven runtime blocker
- For controller-to-use-case injection in this codebase, prefer `@inject(delay(() => UseCase))` on constructor parameters to avoid `TypeInfo not known for "undefined"` issues from import order / circular initialization in Next.js
- Keep `reflect-metadata` initialization centralized in `src/instrumentation.ts` and `src/infrastructure/di/container.ts`; do not scatter `import "reflect-metadata"` across use cases/controllers as a workaround
- **Functional Injection**: For domain entities that require complex parsing or transformations (e.g., Markdown to Project), avoid importing infrastructure helpers directly into the domain. Instead, pass the infrastructure function as a typed callback to the domain method. This maintains the Clean Architecture boundary.

### AI Flows (Genkit)

- AI flows are located in `src/modules/ai/infrastructure/flows/`, organized by category.
- All flow files must have `'use server';` at the top.
- Define input/output Zod schemas in `src/modules/ai/domain/schemas/`.
- **Literal Type Enforcement**: When a flow output schema uses `z.enum`, the implementation must return strings with `as const` (e.g., `status: 'success' as const`) to satisfy strict TypeScript checking.
- **Unified Tool Schemas**: Tool-specific schemas and their inferred types should be centralized in `src/modules/ai/infrastructure/tools/schemas.ts` to prevent circular dependencies and "File is not a module" errors.
- **Plain Text vs. Structured JSON**: For writing tools (Paraphraser, Summarizer, etc.), the project prefers returning **raw Markdown strings** rather than JSON objects. This simplifies frontend rendering and improves reliability with smaller models.
- **Tiered Model Fallback**: To handle 8GB RAM constraints, implement tiered fallback logic (e.g., Llama 3 8B → Phi-3 Mini → Gemma 2B) in the use case or service layer. This ensures system availability when larger models timeout or fail to load.
- **Token-Aware Context Truncation**: Always estimate prompt and context size before generation. For RAG flows, truncate retrieved context (e.g., to 2k tokens for Phi-3's 4k window) to prevent silent overflow and truncation of system instructions.
- **JSON Self-Healing**: For tools requiring structured output, implement a "JSON repair" layer (regex/string manipulation) to fix common small-model errors like trailing commas, unclosed brackets, or markdown wrapping before parsing.
- Use the pattern: define prompt → define flow → export async wrapper function.
- Always handle errors with try/catch and return `Result<T, AiError>` objects.
- Use `MODEL_BY_TASK` constants from `@/modules/ai/domain/constants/AiModels` for consistent model selection:
  - `GEMMA_2B` — preferred for fast text generation and writing tools returning plain text.
  - `PHI3_MINI` — use only when complex structured output (JSON) is strictly required.
  - `LLAMA3_8B` — complex academic/research tasks.

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
- **Direct Domain Imports**: Avoid using monolithic `types.ts` re-export files. Components and hooks should import domain entities (e.g., `User`, `Project`, `Section`) directly from their respective module directories to ensure proper encapsulation and avoid circular dependencies.
- **Entity Consolidation**: Keep domain entities and their corresponding `Properties` interfaces in the same file (e.g., `Project.ts`) to reduce file fragmentation and simplify the type system.
- **Clean Schema Design**: AI input schemas should only contain model-relevant parameters. Avoid redundant metadata fields like `flow: z.literal(...)` as the `WritingToolRegistry` and API layer handle tool identification explicitly via `toolName`.
- **Guest Access Pattern**: Guest users are supported via a `__guest` session cookie. Tools in the `WritingToolRegistry` can be marked with `isFreeForGuests: true` to allow access without registration.
- **Usage Limits**: A daily limit is enforced for free access (5 for guests, 10 for free registered users). This is tracked via IP/UserID using the `RateLimiter` singleton.
- **Real-time Usage Feedback**: AI responses include a `usageMetadata` field. The `useWritingTool` hook automatically detects this and updates the global `AuthContext` usage state to provide immediate UI feedback.

### React / Next.js

- Default to **Server Components**; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Use `'use server'` for Server Actions and all Genkit flow files
- Use the `@/` path alias mapped to `src/` (defined in `tsconfig.json`)
- Event handler props should be named with the `handle` prefix: `handleClick`, `handleSubmit`
- Prefer `const` arrow functions over `function` declarations for components and handlers

### Styling

- Use Tailwind CSS utility classes exclusively — no CSS files or inline styles for new code
- Use the `cn()` utility from `@/infrastructure/utils/cn` for conditional class merging (wraps `clsx` + `tailwind-merge`)
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
- Return consistent JSON responses by using the `handle*Result` helpers (e.g., `handleAiResult`, `handleUserResult`) from `@/infrastructure/api/api-utils`. This ensures a unified error structure, correct HTTP status codes, and automatic telemetry logging.

---

## Firebase & Security

- **Firestore rules** are in `firestore.rules` — always deny by default, whitelist explicitly
- User roles: `'admin'` and `'user'` — check role before any privileged operation
- User profile fields editable by users are explicitly allowlisted in database schemas.
- Firebase Admin SDK is server-only — never import `firebase-admin` in client components.
- **No Client-side Firebase**: The project has been fully purged of client-side Firebase SDKs. Do not re-introduce `firebase/auth`, `firebase/app`, or `firebase/firestore` in client components.
- **Local File Storage**: Firebase Cloud Storage is no longer used. Files are stored locally in `storage/uploads/` and served via `/api/storage/[...path]`.
- Session management uses HTTP-only cookies set via `/api/auth/session`.
- Server-side Firebase initialization (Admin SDK only) is in `src/infrastructure/firebase/server-init.ts`. Firestore initialization is currently disabled.

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
- Use `jest.config.js` aliases — import from `@/infrastructure/`, `@/modules/`, `@/components/`, `@/hooks/`
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
- **Client-Server SDK Decoupling**: AI model names and task constants (`AiModels.ts`) must be located in a dependency-free domain folder. Importing them from server-only SDK entry points (like `Genkit.ts`) pulls heavy Node.js dependencies into the browser bundle, causing Turbopack errors.
- **Node.js Built-in Stubs**: When using libraries that transitively depend on Node.js built-ins (e.g., `perf_hooks`, `net`), ensure they are stubbed in `next.config.ts` using `turbopack.resolveAlias` for the browser bundle.
- Server-only DI registrations must be inside the `typeof window === 'undefined'` guard in `container.ts`
- **Isolated Modules and Decorators**: In classes using `tsyringe` decorators (like `@injectable()`), always import domain interfaces using `import type` (e.g., `import { type IUserRepository } ...`). This prevents "type referenced in a decorated signature" errors when `isolatedModules` and `emitDecoratorMetadata` are enabled.
- **Infrastructure Purity**: Ensure Domain Repository Interfaces (e.g., `IIndexedDocumentRepository.ts`) do not import infrastructure-specific types (like Firebase `Timestamp`). Use native JS types (`Date`, `string`) and handle conversions in the infrastructure implementation.
- **Hook Order Safety**: Never return early from a React component if there are hooks (useState, useEffect, etc.) defined below that return. This causes "Rendered fewer hooks than expected" errors. Always call all hooks at the top level before any conditional logic.
- **Keyboard Shortcut Pattern**: For IDE-style interfaces, centralize shortcut logic in a module-specific hook (e.g., `src/modules/*/adapters/hooks/useKeyboardShortcuts.ts`). This hook should handle platform-specific modifiers (Cmd vs Ctrl) and prevent default browser behavior for common shortcuts like `Cmd+S`.
- **Subagent Delegation**: Even for localized UI enhancements or hook implementations, strictly follow the delegation policy. Use the **Next.js 15 AI Development Assistant** for hook logic and **shadcn/ui Component Builder Assistant** for extending toolbar components. This ensures consistency with the latest framework patterns.
- **Fullscreen Transitions**: When implementing fullscreen modes for document previews, use a `ref` on the root container and manage the `isFullscreen` state via `fullscreenchange` event listeners. Apply `fixed inset-0 z-[100]` classes conditionally to ensure the preview occupies the entire viewport above all other UI layers.
- **Centralized State Management for Multi-Zone Layouts**: For complex IDE-style pages, centralize visibility and interaction states (e.g., `isOutlineVisible`, `activeChapterId`, `zoomLevel`) in a single domain hook or store. This ensures synchronization across disparate UI zones like floating HUDs, sidebars, and the primary canvas, and allows global keyboard shortcuts to trigger UI changes consistently.
- **Large Refactor Strategy**: For massive component rewrites or structural UI changes, prefer using `create_file` with `overwrite: true` instead of stacking multiple `find_and_replace_code` calls. This drastically reduces "No matches found" errors and syntax mismatches in complex JSX blocks.
- Keep domain entities, shared types, and any server-reachable modules free of client-only dependencies (for example drag-and-drop or React UI libraries); they can crash API routes at runtime when imported transitively
- When adding new TanStack Query data fetches, always add a key factory to `src/lib/query-keys.ts`
- Credits are deducted server-side only — never trust client-side credit values
- RTL/LTR layout changes must be tested in both Arabic and English
- **String Spreading Bug**: In use cases or controllers, never use the spread operator (`...`) on a variable that might be a string (e.g., `return { ...result, metadata }`). Spreading a string results in an object with numeric keys (`{ "0": "h", "1": "e" ... }`). Always check `typeof result === 'string'` before attempting to merge with metadata.

## Notes

- When converting function-based modules (especially `adapters/api-client/*`) to class-based DI services, treat it as a 3-part refactor: update the module, register it in `src/infrastructure/di/container.ts`, then update every consumer/import in hooks, stores, and components. Skipping the consumer sweep leaves the codebase in a mixed pattern.
- When relocating UI controls between panels (e.g., moving section-specific tabs or actions to a right sidebar), lift the active selection state to the highest shared owner (such as `useReportGenerator`) and pass it down through the panel component. Remove the original control from list items to avoid duplicated actions and inconsistent state.
- Before doing bulk `find_and_replace_code` changes, inspect the exact file contents with `open_files`/`expand_code_chunks` first. Several files in this project look similar but differ slightly in imports or surrounding code, so guessing exact match strings causes avoidable failed edits.
- Before refactoring a client/helper, `grep` for real call sites first. Some adapters or imports may be unused, partially migrated, or temporarily stubbed in the UI, so updating presumed consumers without verifying usage wastes time and creates avoidable churn.
- If a large route/module needs a structural rewrite and targeted replacements keep failing, prefer reading the full file and then replacing the whole file in one controlled edit instead of stacking many brittle partial replacements.
- Keep heavy export/conversion logic out of hooks and route handlers. Prefer thin hooks/routes that delegate to infrastructure services; wrap existing converter libraries/utilities behind injectable services instead of duplicating conversion logic in UI code.
- Do not use `any` as the first fix for `tsyringe` / `TypeInfo not known for "undefined"` errors. Fix the root cause instead: centralize metadata setup, use `@inject(delay(() => ...))` for controller constructor params, and verify import paths / initialization order.
- When sweeping for direct Firebase usage, distinguish active code from commented-out legacy snippets before planning refactors. Commented imports/usages are not architectural violations and should not drive new work.
- If a service module grows into a data-access concern (for example document tracking in RAG), promote it into an explicit repository interface + infrastructure implementation rather than leaving it as a free-floating helper.
- When converting frontend API clients or service adapters to return `Result` objects, do the consumer sweep in the same pass: update TanStack Query hooks, mutations, and route callers to unwrap success values and `throw result.error` on failure so existing `onError`/error-boundary flows keep working.
- Preserve existing public API response shapes during Result-pattern migrations unless you are also updating every caller. Some endpoints (especially auth/session/signup flows) may intentionally return nested payloads that the frontend already depends on, so swapping them to a generic `handle*Result(...)` response can introduce subtle breakage.
- When adding Jest coverage in this repo, prefer mocking repositories to return `Result.ok(...)` / `Result.fail(...)` directly rather than constructing heavy domain objects unless the entity behavior is what you are testing. Also verify Jest path aliases cover `@/modules/*`, and keep `jest.setup.js` CommonJS-compatible in the current setup.
- For large architecture migrations, prefer staged compatibility shims before deleting old barrels. A temporary re-export layer (for example in `src/lib/types.ts`) can keep the app compiling while imports are migrated module-by-module.
- Avoid repo-wide path rewrites or broad shell replacements until you have verified the exact import patterns with targeted searches. Large `sed`/mass-replace passes can silently create widespread breakage, especially across `src/modules/**/adapters/api-client`, scripts, tests, and case-sensitive file names.
- After moving shared infrastructure such as API clients, Firebase initialization, or RAG utilities, immediately sweep for old import roots and run `npm run typecheck` and `npm run lint` early. These migrations tend to fail from stale imports more than from business-logic bugs.
- When moving files between folders with naming changes, standardize internal imports in the same pass (for example `./Template` vs `./template`, or moved exporter/helper paths). Case mismatches are easy to miss and show up late as type or lint failures.
- Keep domain entities free of framework/browser concerns and avoid circular class dependencies between entities. When two entities need to reference each other, prefer a lightweight `*Properties` interface or ID-based reference rather than importing the full class both ways.
- After overwriting critical files or doing bulk moves, reopen the changed files immediately to verify the actual content on disk. Large automated edits can leave incorrect placeholders, stale imports, or partial content that is not obvious from the write step alone.
- During cleanup, do not delete old directories (`src/services`, `src/lib/models`, legacy helpers) until consumer imports have been migrated and verified. Deleting them too early makes typecheck/lint output much noisier and obscures the real migration order.
- When extracting shared types out of an infrastructure module, do not automatically widen a domain service interface to the most specific concrete option type. If multiple infrastructure implementations hang off the same service contract (for example DOCX and PPTX exporters), keep the domain boundary generic and adapt/cast to the concrete option types inside each infrastructure implementation.
- If you convert an infrastructure type file into a compatibility shim that re-exports moved types, remove the old local duplicate declarations in the same edit. Leaving both the imported re-exports and the original interfaces in place causes TypeScript import/export declaration conflicts that are easy to miss until typecheck.
- The `grep` tool's `path_glob` matches full paths and is not a reliable place for shell-style alternation, brace expansion, or other shell-ish shortcuts. When checking multiple explicit files, prefer a broader glob or separate searches; otherwise a "no matches" result can be misleading.
- **Directory Exploration**: Use `expand_folder` to reliably discover files in a directory. Avoid relying on `grep` with a `path_glob` for exploratory listing, as it may fail to return matches if the path structure is slightly different than expected.
- When multiple routes share the same direct infrastructure access pattern (for example cache stats, cache-hit checks, or retrieval helpers), first extract that shared capability into repository/use-case/controller methods and then migrate the routes as a batch. This reduces duplicated edits and keeps response-shape preservation easier.
- When standardizing API-client or internal repository contracts (e.g., migrating to the Result Object Pattern), treat it as a full slice migration across all layers:
    1.  **Domain**: Define module-specific Errors (e.g., `AdminError`) and update Repository Interfaces.
    2.  **Infrastructure**: Update Repository implementations and add a `handle{Module}Result` helper to `api-utils.ts`.
    3.  **Application**: Refactor Use Cases and Controllers to propagate the Result objects.
    4.  **API/Frontend**: Update route handlers and logic hooks to consume the new Result shape.
- Partial migrations leave mixed raw-return/Result-return patterns that are easy to misuse and break type safety.
- **Database Migration Insights (NoSQL to SQL)**:
    - When migrating from NoSQL (Firestore) to SQLite (Drizzle), use `text` columns for JSON fields (arrays, nested objects) and handle serialization/deserialization explicitly in the repository layer to maintain domain entity compatibility.
    - After changing the database provider, immediately update the DI container (`src/infrastructure/di/container.ts`) and run `npm run typecheck` to catch method signature or argument order mismatches.
    - **Repository Interface Verification**: Before implementing new repositories during a technology switch, always cross-reference the exact method signatures in the Domain Repository Interfaces (`src/modules/*/domain/repositories/*.ts`). SQL and NoSQL repository implementations often differ in argument order or data mapping, and catching these early saves time during the typecheck/fix cycle.
    - **API Client Synchronization**: When updating domain interfaces (e.g., adding dashboard metrics), remember to update the corresponding interface in the `api-client` adapter. Unlike a direct repository change, the frontend often relies on these client-side interface definitions, and missing them causes `tsc` failures in components.
- **Injectable Utilities**: Cross-cutting utilities (Cache, Cookie, Session management) should be promoted to injectable services with domain-level interfaces. This allows for clean dependency injection, better test mocking, and consistent architectural patterns across the application.
- **Domain Entity ID Generation**: Domain entities (e.g., `Project`, `Chapter`, `Section`) should not implicitly generate their own IDs (e.g., via `uuidv4` in the constructor). This ensures hydration is predictable. IDs should be generated by the repository for new entities or passed explicitly from the application layer.
- **Intelligence Suite Aesthetics (IDE Pattern)**:
    - **Typography Matrix**: Use high-density technical labels (`text-[10px]` or `text-[11px]`, `font-black`, `uppercase`, `tracking-[0.15em]` to `[0.3em]`) for UI controls and metadata. Contrast this with a premium serif stack (`text-[16px]`, `leading-[1.75]`) for AI-generated prose.
    - **Glassmorphism & Depth**: Utilize `bg-background/40`, `backdrop-blur-2xl`, and `border-primary/10` for panels. For deep immersion, use multi-layered shadows (e.g., `shadow-[0_0_80px_-20px_...]`) on primary document canvases.
    - **3-Zone Workspace Architecture**: When building complex editing interfaces, follow the "IDE Pattern": Top Zone (Session Actions), Left Zone (Files/Setup), Center Zone (Document Canvas), Right Zone (AI Tools/Properties).
    - **Contextual HUD Pattern**: For document-specific utility controls (like Zoom or Page Navigation), use a semi-transparent floating glassmorphism HUD (`backdrop-blur-xl`, `bg-background/60`) at the bottom-center. This keeps primary toolbars clean.
    - **Collapsible Sidebar Hierarchy**: Manage large project trees by implementing animated collapsible chapters (using `Framer Motion`'s `AnimatePresence`). This allows users to focus on specific sections without sidebar clutter.
- When tightening TanStack Query key design, avoid placeholder scopes like shared detail keys if the data is actually user-scoped. Update invalidation/removal call sites in the same pass so cache behavior stays coherent.
- For Jest in this repo, React hook/context tests may need environment support beyond the default config: ensure the `@/` alias is mapped, JSX in `.tsx` tests is transformed correctly, `.next/` is ignored to avoid haste collisions, and `reflect-metadata` is loaded before code that imports `tsyringe`.
- When a hook/unit test pulls in a heavy domain entity with ESM-only or parser-heavy transitive imports, prefer mocking that entity/module at the test boundary rather than widening Jest transforms to chase unrelated runtime dependencies.
- For small authenticated client-side mutations that do not yet justify a dedicated API client abstraction, prefer `apiService({ firebaseUser, ... })` over hand-written `getIdToken()` + `fetch(...)` logic. It keeps auth/header/error handling consistent and makes later migrations easier.
- In Jest, make mocks match the exact import path used by the module under test. If the hook imports `../../core/useBuilderStore`, mocking a different alias or relative path will not intercept the dependency and can lead to confusing failures.
- When `find_and_replace_code` reports multiple matches inside the same file, stop retrying the same short snippet. Reopen or expand the file and anchor the replacement with adjacent unique context such as the surrounding method signature or neighboring lines.
- During typing cleanups, start with low-risk replacements that reuse existing domain contracts: controller/use-case method parameters, `Pick<...>` payload shapes, domain union types, and `catch (error: unknown)` narrowing. Save deeper generic/infrastructure typing work for a later pass.
- When moving a raw `fetch(...)` path onto the shared `apiService`, verify the shared service actually supports the response shape you need first (for example `blob` or `text`). Extend the central service/options once, then migrate consumers; otherwise you create avoidable typecheck fallout in every caller.
- When converting an API client from raw returns to `Result<T, ApiError>`, immediately sweep all helper hooks that call it indirectly (especially shared file-upload logic in writing-tool hooks). These indirect consumers are easy to miss and show up later as repetitive type errors.
- In tests for query-backed Zustand/store hooks, avoid asserting derived selection state that only becomes true after a refetch updates the query data. Prefer asserting stable boundaries such as returned mutation values, cache invalidation, or explicit setter calls unless the refetch is part of the test setup.
- When converting an API client or helper from raw values to `Result<T, ApiError>`, sweep prefetch/query consumers as well as mutation callers. Component-level `prefetchQuery` functions and infinite-query loaders are easy to miss and will otherwise cache `Result` objects instead of domain data.
- When renaming or upgrading a shared helper (`runAuthenticatedClientCall` → `runAuthenticatedResultCall`, etc.), immediately update Jest mocks in existing tests to match the new export shape. Refactors often fail first in tests because the mock contract lags behind the production import.
- In hook/unit tests for rich domain collections (for example `ProjectContent` unions), prefer lightweight doubles plus explicit `as any` casts at the test boundary over constructing fake full entities. This keeps tests focused on hook behavior instead of unrelated domain initialization requirements.
- In this repo, broad content searches are often more reliable than highly constrained `path_glob` searches for final cleanup sweeps. If a targeted glob returns surprising "no matches" results, retry with a simpler repo-wide content search and then open the concrete files directly.
- When converting a direct-`fetch(...)` component/page to `apiService`, a small full-file rewrite is often safer than stacking many local replacements. These components usually get shorter once auth, headers, and parsing are centralized, and whole-file rewrites avoid leaving mixed old/new request logic behind.
- For Jest component tests in this repo, prefer locally mocking ESM-heavy visual dependencies like `lucide-react` rather than widening global transform settings. It keeps tests focused on behavior and avoids unnecessary parser/config churn.
- When adding new TypeScript Jest tests, do not assume `@testing-library/jest-dom` matcher types are visible to `tsc` just because the runtime setup file requires them. Either ensure the ambient typings are configured explicitly or prefer plain Jest assertions (`toBeTruthy`, equality, length checks) in new tests to avoid typecheck-only failures.
- **Database Migration Insights (NoSQL to SQL)**:
    - When migrating from NoSQL (Firestore) to SQLite (Drizzle), use `text` columns for JSON fields (arrays, nested objects) and handle serialization/deserialization explicitly in the repository layer to maintain domain entity compatibility.
    - After changing the database provider, immediately update the DI container (`src/infrastructure/di/container.ts`) and run `npm run typecheck` to catch method signature or argument order mismatches.
    - **Repository Interface Verification**: Before implementing new repositories during a technology switch, always cross-reference the exact method signatures in the Domain Repository Interfaces (`src/modules/*/domain/repositories/*.ts`). SQL and NoSQL repository implementations often differ in argument order or data mapping, and catching these early saves time during the typecheck/fix cycle.
    - **API Client Synchronization**: When updating domain interfaces (e.g., adding dashboard metrics), remember to update the corresponding interface in the `api-client` adapter. Unlike a direct repository change, the frontend often relies on these client-side interface definitions, and missing them causes `tsc` failures in components.
    - **Local Auth Transition**: Replacing Firebase Auth with local SQLite auth is a "full-slice" migration. It requires: 1) Backend storage (password hashes), 2) Sign-in logic (JWT/bcrypt), 3) API routes (`/login`, `/signup`, `/me`), 4) `AuthContext` refactoring to use local `/me` instead of SDK listeners like `onAuthStateChanged`.
    - **Session Flow**: Local auth relies on HTTP-only cookies. After successful login/signup, the API should set the cookie, and the frontend should typically perform a `window.location.href` refresh to ensure `AuthContext` re-runs its initialization flow and picks up the new user state.
    - **Authentication Fallback**: The `withAuth` middleware (`src/lib/utils/api-utils.ts`) supports both `Authorization: Bearer <token>` headers and `__session` cookies. This provides compatibility between standard API clients (token-based) and direct browser-based component calls (cookie-based). If a route returns "Missing token", ensure the client is either passing a token to `apiService` or the user has a valid session cookie.
    - **Client-side Hook Requirements**: When using `useSearchParams` or similar client-side hooks in Next.js App Router (especially in shared layouts or direct pages), always wrap the component in a `<Suspense>` boundary to prevent hydration mismatches or build-time errors.
    - **JSON Field Handling**: In SQLite repositories, handle JSON fields (arrays/objects) by using `JSON.stringify` on save and `JSON.parse` on read. This maintains compatibility with domain entities originally designed for NoSQL stores like Firestore.
    - **Relational Aggregations**: After migrating to SQL, leverage `JOIN`, `GROUP BY`, and `HAVING` clauses for dashboard reports (e.g., user retention, account sharing) instead of performing client-side or application-level filtering. This significantly reduces data transfer and improves performance.
    - Prefer `drizzle-kit push` for rapid schema iteration in development before committing to migrations.
    - Create specialized seeding scripts (`sqlite-seed.ts`) when moving away from Firebase, as legacy seeding logic often relies on Firebase-specific batching or initialization.
    - **Manual Schema Synchronization**: If automated tools like `drizzle-kit push` cannot handle schema changes in a non-interactive environment (e.g., due to data loss prompts), use direct SQL `ALTER TABLE` commands via the database driver to synchronize the physical file with the code schema.
    - During infrastructure cleanup, perform a full sweep to delete stale repositories and initialization logic (e.g., in `server-init.ts`). For example, remove `admin.database()` calls if RTDB is no longer used, as they can trigger runtime errors if configuration URLs are missing. Carefully preserve shared services like Auth, Storage, or Notifications if they are still required.
    - **Shared Utility Sweeps**: After a major technology shift (like removing Firebase), perform a dedicated sweep of shared utilities (`ApiService.ts`, `errorUtils.ts`, etc.) to remove deprecated types and logic. These "quiet" dependencies can leak old architectural patterns into new code if not removed.
    - **Dependency Injection for New Services**: When introducing new cross-cutting services (like `IEmailService`), define a domain-level interface and use a unique `Symbol` token for registration in the DI container. This maintains loose coupling even when implementation details (like SMTP vs. API-based email) change.
    - **Module-Based Frontend Migration**: When relocating components/hooks to module adapters, immediately update `tailwind.config.ts` to include the new directory in the `content` array. Failing to do so will result in missing CSS utility styles for those components.
    - **Mass Import Refactoring**: For large-scale file moves, use `sed` or `grep/xargs` with absolute path aliases (`@/modules/...`) to update imports repo-wide. This is significantly more efficient than individual `find_and_replace_code` calls but requires careful regex validation.
    - **Hydration & Suspense**: Always verify that any client component using `useSearchParams` is wrapped in a `<Suspense>` boundary in its parent page to prevent hydration mismatches and build-time errors in Next.js 15.
    - **State Management Localization**: Move domain-specific Zustand stores from `src/hooks/core/` to their respective module's `adapters/state/` directory. This ensures that state is encapsulated alongside the logic and components that use it.
    - **API Standardization**: Ensure all API clients in `adapters/api-client/` follow the `Result<T, ApiError>` pattern. This provides consistent error handling and type safety across the frontend. Refactor any raw `fetch` or `Promise<T>` calls to use the `ApiService` wrapper.
    - **JSON Field Serialization**: In SQLite repositories, handle JSON fields (arrays/objects) by using `JSON.stringify` on save and `JSON.parse` on read. This maintains compatibility with domain entities originally designed for NoSQL stores like Firestore.
    - **Relational Aggregations**: After migrating to SQL, leverage `JOIN`, `GROUP BY`, and `HAVING` clauses for dashboard reports (e.g., user retention, account sharing) instead of performing client-side or application-level filtering. This significantly reduces data transfer and improves performance.
    - **Isolated Modules and Decorators**: In classes using `tsyringe` decorators (like `@injectable()`), always import domain interfaces using `import type` (e.g., `import { type IUserRepository } ...`). This prevents "type referenced in a decorated signature" errors when `isolatedModules` and `emitDecoratorMetadata` are enabled.
    - **Infrastructure Purity**: Ensure Domain Repository Interfaces (e.g., `IIndexedDocumentRepository.ts`) do not import infrastructure-specific types (like Firebase `Timestamp`). Use native JS types (`Date`, `string`) and handle conversions in the infrastructure implementation.
    - **Injectable Utilities**: Cross-cutting utilities (Cache, Cookie, Session management) should be promoted to injectable services with domain-level interfaces. This allows for clean dependency injection, better test mocking, and consistent architectural patterns across the application.
    - **Repository Interface Verification**: Before implementing new repositories during a technology switch, always cross-reference the exact method signatures in the Domain Repository Interfaces (`src/modules/*/domain/repositories/*.ts`). SQL and NoSQL repository implementations often differ in argument order or data mapping, and catching these early saves time during the typecheck/fix cycle.
    - **API Client Synchronization**: When updating domain interfaces (e.g., adding dashboard metrics), remember to update the corresponding interface in the `api-client` adapter. Unlike a direct repository change, the frontend often relies on these client-side interface definitions, and missing them causes `tsc` failures in components.
    - **Local Auth Transition**: Replacing Firebase Auth with local SQLite auth is a "full-slice" migration. It requires: 1) Backend storage (password hashes), 2) Sign-in logic (JWT/bcrypt), 3) API routes (`/login`, `/signup`, `/me`), 4) `AuthContext` refactoring to use local `/me` instead of SDK listeners like `onAuthStateChanged`.
    - **Session Flow**: Local auth relies on HTTP-only cookies. After successful login/signup, the API should set the cookie, and the frontend should typically perform a `window.location.href` refresh to ensure `AuthContext` re-runs its initialization flow and picks up the new user state.
    - **Authentication Fallback**: The `withAuth` middleware (`src/lib/utils/api-utils.ts`) supports both `Authorization: Bearer <token>` headers and `__session` cookies. This provides compatibility between standard API clients (token-based) and direct browser-based component calls (cookie-based). If a route returns "Missing token", ensure the client is either passing a token to `apiService` or the user has a valid session cookie.
    - **Client-side Hook Requirements**: When using `useSearchParams` or similar client-side hooks in Next.js App Router (especially in shared layouts or direct pages), always wrap the component in a `<Suspense>` boundary to prevent hydration mismatches or build-time errors.
    - **JSON Field Handling**: In SQLite repositories, handle JSON fields (arrays/objects) by using `JSON.stringify` on save and `JSON.parse` on read. This maintains compatibility with domain entities originally designed for NoSQL stores like Firestore.
    - **Relational Aggregations**: After migrating to SQL, leverage `JOIN`, `GROUP BY`, and `HAVING` clauses for dashboard reports (e.g., user retention, account sharing) instead of performing client-side or application-level filtering. This significantly reduces data transfer and improves performance.
    - Prefer `drizzle-kit push` for rapid schema iteration in development before committing to migrations.
    - Create specialized seeding scripts (`sqlite-seed.ts`) when moving away from Firebase, as legacy seeding logic often relies on Firebase-specific batching or initialization.
    - **Manual Schema Synchronization**: If automated tools like `drizzle-kit push` cannot handle schema changes in a non-interactive environment (e.g., due to data loss prompts), use direct SQL `ALTER TABLE` commands via the database driver to synchronize the physical file with the code schema.
    - During infrastructure cleanup, perform a full sweep to delete stale repositories and initialization logic (e.g., in `server-init.ts`). For example, remove `admin.database()` calls if RTDB is no longer used, as they can trigger runtime errors if configuration URLs are missing. Carefully preserve shared services like Auth, Storage, or Notifications if they are still required.
    - **Shared Utility Sweeps**: After a major technology shift (like removing Firebase), perform a dedicated sweep of shared utilities (`ApiService.ts`, `errorUtils.ts`, etc.) to remove deprecated types and logic. These "quiet" dependencies can leak old architectural patterns into new code if not removed.
    - **Dependency Injection for New Services**: When introducing new cross-cutting services (like `IEmailService`), define a domain-level interface and use a unique `Symbol` token for registration in the DI container. This maintains loose coupling even when implementation details (like SMTP vs. API-based email) change.
    - **Module-Based Frontend Migration**: When relocating components/hooks to module adapters, immediately update `tailwind.config.ts` to include the new directory in the `content` array. Failing to do so will result in missing CSS utility styles for those components.
    - **Mass Import Refactoring**: For large-scale file moves, use `sed` or `grep/xargs` with absolute path aliases (`@/modules/...`) to update imports repo-wide. This is significantly more efficient than individual `find_and_replace_code` calls but requires careful regex validation.
    - **Hydration & Suspense**: Always verify that any client component using `useSearchParams` is wrapped in a `<Suspense>` boundary in its parent page to prevent hydration mismatches and build-time errors in Next.js 15.
    - **State Management Localization**: Move domain-specific Zustand stores from `src/hooks/core/` to their respective module's `adapters/state/` directory. This ensures that state is encapsulated alongside the logic and components that use it.
    - **API Standardization**: Ensure all API clients in `adapters/api-client/` follow the `Result<T, ApiError>` pattern. This provides consistent error handling and type safety across the frontend. Refactor any raw `fetch` or `Promise<T>` calls to use the `ApiService` wrapper.
    - **Backend-Agnostic API Clients**: When moving to cookie-based authentication, refactor all API clients to remove explicit `token` parameters simultaneously. This prevents "Missing token" (401) errors in the frontend. Ensure every method returns a `Result<T, ApiError>` for consistent error handling in TanStack Query hooks.
    - **Type Mismatch Cleanup**: After removing properties from shared utilities (like `firebaseUser` from `apiService`), perform a project-wide search to remove stale property passing in components and hooks to avoid "Property does not exist on type" errors.
    - **Query Key Factory Completeness**: Before refactoring a large set of hooks, verify that the `src/lib/query-keys.ts` factory includes all required patterns (especially `lists(type)` and `detail(type, id)` for varied entities). Missing keys are a common cause of build-time failures during architectural shifts.
    - **Preserving Domain Logic**: During full-file overwrites of domain entities (e.g., `User.ts`), ensure utility methods like `getInitials()` or `getFormattedDate()` are preserved. These are often missed if the focus is purely on schema/property updates.
    - **Entity Instantiation in Repositories**: In SQLite repositories, always return full domain entity instances (e.g., `new User(data)`) instead of raw database objects. This ensures frontend components can access essential utility methods like `getFormattedDate()` and `getInitials()` without manual casting or re-instantiation.
    - **Class Import Awareness**: When a component needs to instantiate a domain entity (e.g., `new Transaction(t)`), ensure the class is imported as a value, not just a type. Using `import type { Transaction }` will cause "Transaction cannot be used as a value" errors when attempting to call the constructor.
    - **Type Mismatch Cleanup**: After removing properties from shared utilities (like `firebaseUser` from `apiService`), perform a project-wide search to remove stale property passing in components and hooks to avoid "Property does not exist on type" errors.
    - **Defensive UI Data Handling**: Always wrap external data formatting (e.g., `new Date(createdAt)` or `formatDistanceToNow`) in defensive checks or `try-catch` blocks. This prevents runtime crashes (like `Invalid time value`) if the backend returns malformed data or if a hook is temporarily using a placeholder.
    - **Admin UI Guards**: When adding administrative features to shared/global components (like the Notification Dropdown or Header), always wrap them in explicit role checks (e.g., `userProfile?.role === 'admin'`) to ensure they are hidden from standard users.
    - **Relational Indexing**: For high-growth tables like generation logs or notifications, proactively add indices to columns used in filters or cron-job queries (e.g., `status`, `userId`, `scheduledFor`) within the Drizzle schema to maintain performance over time.
    - **Removal of src/lib**: The `src/lib` directory has been completely removed. All contents have been moved to `src/infrastructure/` (generic) or `src/modules/*/` (domain-specific). Do not create new files in `src/lib`.
    - **Relocated Schemas**: Zod schemas for validation now live in `src/modules/*/domain/schemas/`.
    - **Relocated Exporters**: Heavy infrastructure exporters (PPTX, PDF) now live in `src/modules/templates/infrastructure/exporters/` or similar module-specific infrastructure paths.
    - **Relocated Editor Logic**: Tiptap extensions and editor controllers now live in `src/modules/ai-content/infrastructure/editor/`.
    - **Standardized API Service**: Always use `apiService` from `@/infrastructure/api/ApiService` for client-server communication. Ensure all methods return a `Result` object for consistent error handling.
    - **Next.js 15 Compatibility**: Always wrap components using `useSearchParams` in a `<Suspense>` boundary to avoid build-time errors and hydration mismatches.
    - **Tailwind Content Updates**: When creating new module component directories, ensure they are added to the `content` array in `tailwind.config.ts`.
    - **Import Aliases**: Always prefer absolute path aliases (`@/modules/...`, `@/infrastructure/...`) over deep relative paths (`../../../`) to maintain stability during architectural changes.
    - **Foundational Logic**: Foundational utilities (e.g., `cn`, `result`, `randomId`) and cross-cutting infrastructure (e.g., `ApiService`, `api-utils`, `cache`, `i18n`, `security`) reside in `src/infrastructure/`.
    - **Domain Logic Co-location**: All domain-specific logic, including utilities (e.g., `plantuml-utils`), schemas (e.g., `ProjectSchema`), and infrastructure services (e.g., `pdf-utils`), must live within its respective module under `src/modules/`.
    - **Refactoring Strategy**: When performing large-scale directory moves, use a 3-pass sweep: 1) Physically move files, 2) Perform global import updates using path aliases, 3) Run `npm run typecheck` and manually resolve relative path discrepancies in deep module trees.
    - **Surgical Code Updates**: For critical files with many imports (like `WritingToolRegistry` or barrel files), prefer using `create_file` with the full content over many small `sed` or `find_and_replace_code` calls. This avoids accidental corruption from overlapping regex matches.
    - **Dependency Inversion for Tools**: Ensure AI tools are defined using the Genkit instance resolved from the module's service layer (`infrastructure/services/Genkit.ts`) rather than global instances to maintain architectural isolation.
    - **Barrel Export Integrity**: When renaming or categorizing exports in a barrel file (like `flows/index.ts`), always cross-reference with the `WritingToolRegistry` to ensure key-function mapping remains consistent.
    - **Legacy Cleanup**: The `src/lib` and `src/hooks/core` directories have been retired to eliminate architectural drift. Do not re-introduce them. All shared logic must now be categorized as either generic Infrastructure or domain-specific Module logic.
    - **CSS Hygiene**: Avoid defining complex layout logic (like A4 dimensions or zoom scales) in global CSS if it's managed by React state. Prefer utility-first Tailwind classes and scoped component logic to keep `globals.css` lean and prevent orphaned styles during refactors.
    - **Functional Injection for Pure Domains**: When a domain entity (e.g., `Project`) needs to perform a complex transformation that depends on infrastructure (e.g., Markdown parsing), do not import the infrastructure helper directly. Instead, pass the helper as a typed callback to the entity's method. This keeps the Domain layer free of framework/library dependencies.
    - **Direct Module Imports**: Never use a monolithic `types.ts` or `index.ts` re-export file for domain entities. Components and hooks must import entities (e.g., `User`, `Project`, `Section`) directly from their respective module paths to enforce strict encapsulation and avoid circular dependencies.
    - **Memoization Pitfall**: When wrapping components in `React.memo()`, explicitly import `React` from `'react'` to avoid runtime `ReferenceError` in certain build environments (like Turbopack).
    - **Zustand Performance**: Always use atomic selectors (`useStore(state => state.value)`) instead of monolithic destructuring (`const { value } = useStore()`) in high-frequency components to minimize re-renders when unrelated store properties change.
    - **AI Tool Registry**: The `WritingToolRegistry` (`src/modules/ai/application/services/WritingToolRegistry.ts`) maps tool names to their categorized flow implementations and schemas. When adding a new tool, register it here using the standardized function names from the flows index.
    - **Infrastructure Gateway**: `GenkitAiService` acts as the primary gateway for running flows. Prefer calling flows through this service to leverage the request queue and model selector features.
    - **Git Recovery**: If bulk file moves or deletions cause working tree issues, use `git show stable:<path> > <new-path>` to recover specific file contents accurately.
    - **Turbopack & `server-only`**: Do NOT add `import 'server-only'` to modules that are transitively reachable from client components — even through `require()` inside a `typeof window === 'undefined'` guard. Turbopack enforces `server-only` at the module boundary and throws a hard build error. Instead, use the `typeof window === 'undefined'` guard with `require()` for server-only code, and stub Node.js built-ins (like `async_hooks`) via `turbopack.resolveAlias` in `next.config.ts`.
    - **Turbopack `resolveAlias` paths**: When setting `turbopack.resolveAlias` for browser stubs in `next.config.ts`, use `path.resolve('./path/to/stub')` (absolute path via `path` module) rather than a relative string. Relative strings may not resolve correctly in Turbopack.
    - **DI Container Split Anti-pattern**: Do NOT split server-only DI registrations into a separate file loaded only via `instrumentation.ts`. In Turbopack dev mode, hot-reloaded API routes resolve from the container before `instrumentation.ts` re-runs, causing "unregistered dependency token" errors. Keep all registrations in `container.ts` using `typeof window === 'undefined'` + `require()` — this runs synchronously whenever the module is loaded on the server, with no timing race.
    - **Genkit Duplicate Prompt Warning**: The `ERROR: /prompt/X already has an entry in the registry. Overwriting.` warning in dev is a Genkit hot-reload artifact — not a real error. It occurs when the dev server re-evaluates modules that call `ai.definePrompt()`. It is harmless and can be ignored.
    - **Git Corrupt History Recovery**: When `git push` fails due to missing/corrupted objects deep in history, create `.git/shallow` containing the SHA of the last accessible commit. This tells git to treat that commit as a root (no parents), allowing push of all accessible history without the missing objects.
- **Variable Shadowing in React**: When using `useAuth()`, prefer naming the destructured variable `user: authUser` if the component already uses a local `user` property (e.g., in a list or prop). This prevents "Duplicate identifier" errors and improves clarity.
- **Controlled Input Fallbacks**: To avoid "changing a controlled input to be uncontrolled" errors, always provide a fallback value (e.g., `value={val || ''}`) for text inputs if the underlying state might be initially `null` or `undefined`.
- **Local File Storage Transition**: Replaced Firebase Cloud Storage with a local filesystem-based solution. The `LocalFileStorageService` saves files to `storage/uploads/` and returns relative API URLs (`/api/storage/uploads/...`).
- **Secure File Serving**: The dynamic route `src/app/api/storage/[...path]/route.ts` serves local files. It MUST include path traversal protection (`relativePath.includes('..')`) and use `mime-types` for correct `Content-Type` headers.
- **Isolated Modules and Decorators**: In classes using `tsyringe` decorators (like `@injectable()`), always import domain interfaces using `import type` (e.g., `import { type IUserRepository } ...`). This prevents "type referenced in a decorated signature" errors when `isolatedModules` and `emitDecoratorMetadata` are enabled.
- **Fullscreen IDE Layouts**: When building fullscreen IDE-style pages (like the Builder), set the root container height to `h-[calc(100vh-64px)]` to account for the sticky global Header. This prevents double scrollbars and ensures the workspace fills the viewport perfectly.
- **Intelligence Suite Aesthetics**: Achieve a premium "tool" feel by using a technical typography stack for metadata and labels: `text-[10px]`, `font-black`, `uppercase`, and `tracking-[0.2em]`.
- **Panel Resilience**: To maintain usability during `ResizablePanel` operations, ensure sidebar content areas have a `min-width` constraint (e.g., `min-w-[320px]`) and use `flex-1 min-h-0` on internal containers to isolate nested scrollable areas (like Chapter lists or AI Chat).
- **WYSIWYG Alignment**: When nesting a text editor inside a physical page preview (like `A4Page`), remove internal container paddings from the editor so the prose aligns perfectly with the preview margins, creating a seamless "What You See Is What You Get" transition.
- **Tactile Desktop Feedback**: In desktop-only workspaces, prioritize subtle layout transitions like `hover:translate-x-0.5` over simple color changes to provide a more responsive and premium tactile feel.
- **3-Zone Workspace Architecture**: When building complex editing interfaces, follow the "IDE Pattern":
    - **Top Zone**: Horizontal bar for project-wide identity and Session Actions (Export, Save, New).
    - **Left Zone**: Primary navigation and Setup Tools (Files, Templates, Chapter list).
    - **Center Zone**: The primary focus/document preview (A4 canvas, Editor).
    - **Right Zone**: Context-sensitive AI controls and properties (Section parameters, Guidelines, Chat).
- **State Lifting for UI Zones**: When orchestrating multiple interactive zones, lift the active tab/panel state to the main page hook (e.g., `useReportGenerator`). This allows one zone (like the Chapter list) to automatically trigger updates or focus changes in another (like the Right Sidebar's active tab).
- **Collapsible Sidebar Hierarchy**: Manage large project trees by implementing animated collapsible chapters (using `Framer Motion`'s `AnimatePresence`). This allows users to focus on specific sections while maintaining high-level structural awareness without sidebar clutter.
- **Contextual HUD Pattern**: For document-specific utility controls (like Zoom or Page Navigation), use a semi-transparent floating HUD (`backdrop-blur-xl`, `bg-background/60`) at the bottom-center. This keeps the primary toolbars clean and ensures actions are always within reach of the focus area.
- **Floating HUD Pattern**: For utility controls that shouldn't clutter the main toolbars (e.g., Document Outline), use a floating glassmorphism HUD (`bg-background/60`, `backdrop-blur-2xl`, `border-primary/10`) with absolute positioning and `AnimatePresence` transitions.
- **Status-Driven Minimalist Indicators**: Use colored dot pulses (`bg-green-500`, `bg-amber-500`) to provide high-density status information (e.g., content presence) without text clutter.
- **Dialog-to-Sidebar Migration**: For item-level AI actions (like Chapter Tools or Section Context), prefer native sidebar tabs over modal dialogs. This "Contextual Sidebar" pattern maintains the user's flow and provides a faster, more integrated editing experience.
- **Action Bar Segmentation**: When building high-density action bars (like session controls), group related buttons (e.g., File Ops vs. Persistence) and separate them with subtle vertical dividers. This improves visual scanning and reduces cognitive load.
- **Dynamic Action Highlighting**: Use conditional styling to emphasize primary actions when they are most relevant (e.g., highlighting the "Save" button only when unsaved changes exist). This provides intuitive guidance without needing explicit alerts.
- **Manifest Design Pattern**: For complex multi-step processes (Export, Build, Library, TOC Architect, RAG Ingestion), use a "Manifest" dialog layout: a technical header with a pulse icon, a clear data hierarchy in the body (often split into 2 columns), and a professional footer with versioning. This establishes a "Production Grade" feel for critical operations.
- **Immersive Branding**: Integrate brand identity through specialized containers (e.g., logo HUDs), animated status pulses, and glass-morphism effects. Avoid standard "Website" styles in favor of "Intelligence Suite" aesthetics.
- **Unified Markdown Editing**: When editing multi-entity projects (Chapters, Sections), use a single `MarkdownEditor` instance for the entire project instead of fragmented per-section editors. This provides a smoother, professional writing experience. Use `project.fullMarkdownContent` for serialization and `updateProjectFromMarkdown` for deserialization.
- **Smart Editor Synchronization**: In Tiptap-based editors, only update content from props (`setContent`) when the change is external (e.g., `!editor.isFocused`). This prevents cursor jumping and race conditions during active typing while keeping the store in sync.
- **Hybrid Preview/Edit Pattern**: Maintain a structural `MarkdownViewer` map for "Preview Mode" while using a unified editor for "Edit Mode". This balances the need for a hierarchical review with the flexibility of a cohesive document editor.
- **Clean Component Integration**: Ensure shared components like `MarkdownViewer` support optional flags (e.g., `noScroll`) to integrate seamlessly into high-fidelity canvas layouts like `A4Page` without redundant scrollbars or UI clutter.
- **Collapsible Resizable Panels**: When a side panel's content is toggled off, dynamically adjust the `ResizablePanel` props (`minSize`, `maxSize`, `defaultSize`) to a minimum value (e.g., 4%) to shrink the panel to its icon HUD. Apply `transition-all duration-500` to the panel to ensure the layout shift is smooth and matches the "Intelligence Suite" aesthetic.
- **Sidebar Toggle Pattern**: In HUD components like `CollapsibleSidePanel`, the `onActiveKeyChange` handler should support toggling (e.g., `onActiveKeyChange(isActive ? '' : panel.key)`). This allows users to hide the content area and reclaim canvas space by clicking the active icon again.
- **Readonly Property Mismatch**: When defining domain entities vs state properties, ensure `readonly` modifiers match exactly (e.g., `readonly string[]` vs `string[]`) to avoid `tsc` assignment errors during store updates or entity instantiation.
- **Explicit Entity Casting in UI**: When utilizing domain getters that return specialized types (like `readonly Chapter[]`), use explicit casting in the UI component to satisfy `tsc` if the base interface is more generic.
- **Centralized State Management for Multi-Zone Layouts**: For complex IDE-style pages, centralize visibility and interaction states (e.g., `isOutlineVisible`, `activeChapterId`) in a single domain hook. This ensures synchronization across disparate UI zones like floating HUDs, sidebars, and the primary canvas.

- **Collapsible Resizable Panels**: When a side panel's content is toggled off, dynamically adjust the `ResizablePanel` props (`minSize`, `maxSize`, `defaultSize`) to a minimum value (e.g., 4%) to shrink the panel to its icon HUD. Apply `transition-all duration-500` to the panel to ensure the layout shift is smooth and matches the "Intelligence Suite" aesthetic.

- **Sidebar Toggle Pattern**: In HUD components like `CollapsibleSidePanel`, the `onActiveKeyChange` handler should support toggling (e.g., `onActiveKeyChange(isActive ? '' : panel.key)`). This allows users to hide the content area and reclaim canvas space by clicking the active icon again.

- **Intelligence Suite Aesthetics (IDE Pattern)**:
    - **Typography Matrix**: Use high-density technical labels (`text-[10px]` or `text-[11px]`, `font-black`, `uppercase`, `tracking-[0.15em]` to `[0.3em]`) for UI controls and metadata. Contrast this with a premium serif stack (`text-[16px]`, `leading-[1.75]`) for AI-generated prose.
    - **Glassmorphism & Depth**: Utilize `bg-background/40`, `backdrop-blur-2xl`, and `border-primary/10` for panels. For deep immersion, use multi-layered shadows (e.g., `shadow-[0_0_80px_-20px_...]`) on primary document canvases.
    - **Technical Decorations**: Integrate "architectural" elements like radial dot grids (`radial-gradient`), technical crop marks, and animated pulse indicators for live AI states.
    - **Fluid Sidebar Layouts**: Avoid `self-start` or fixed `h-full` on side panels intended for `ResizablePanel` containers. Use `flex-1 min-h-0` on both the side panel and its host container to ensure fluid, integrated scroll management.
    - **Editor/Preview Parity**: When styling document previews (like `A4Page`), ensure the Tiptap `MarkdownEditor` prose classes exactly mirror the preview styles to prevent visual shifting during the edit-to-preview transition.

### Security Patterns
- **Rate Limiting**: For single-instance SQLite deployments, use the in-memory `rate-limiter.ts` utility. For serverless or multi-instance environments, migrate this utility to use an external store like Redis.
- **Client Identification**: In Next.js 15 App Router API routes, retrieve the client IP for rate limiting using `(await headers()).get('x-forwarded-for')`.
- **Sensitive Route Protection**: Always apply rate limiting to authentication endpoints (`/login`, `/forgot-password`, `/signup`) to mitigate brute-force and resource abuse attacks.
- **User Fingerprinting**: Use a combination of browser attributes (UserAgent, Screen Res, Timezone) and the Web Crypto API (`crypto.subtle.digest`) to generate a unique device hash. This aids in detecting account sharing and suspicious login patterns without requiring external libraries.
- **Global Session Invalidation**: Implement a `tokenVersion` integer in the user table and include it in the JWT payload. Incrementing this version on the server immediately invalidates all active sessions for that user without needing a centralized blacklist store.
- **Large Refactor Strategy**: For massive component rewrites or structural UI changes, prefer using `create_file` with `overwrite: true` instead of stacking multiple `find_and_replace_code` calls. This drastically reduces "No matches found" errors and syntax mismatches in complex JSX blocks.
- **Sidebar Design Patterns**: For narrow sidebars (20-25%), maintain readability using a "Dashboard Density" style: `text-[10px]` bold uppercase tracking for labels, `bg-muted/5` for input backgrounds, and `text-[11px]` for secondary descriptions. Use `ScrollArea` with `pb-20` to ensure bottom elements are accessible.
- **3-Zone Workspace Architecture**: When building complex editing interfaces, follow the "IDE Pattern":
    - **Top Zone**: Horizontal bar for project-wide identity and Session Actions (Export, Save, New).
    - **Left Zone**: Primary navigation and Setup Tools (Files, Templates, Chapter list).
    - **Center Zone**: The primary focus/document preview (A4 canvas, Editor).
    - **Right Zone**: Context-sensitive AI controls and properties (Section parameters, Guidelines, Chat).
- **State Lifting for UI Zones**: When orchestrating multiple interactive zones, lift the active tab/panel state to the main page hook (e.g., `useReportGenerator`). This allows one zone (like the Chapter list) to automatically trigger updates or focus changes in another (like the Right Sidebar's active tab).
- **Collapsible Sidebar Hierarchy**: Manage large project trees by implementing animated collapsible chapters (using `Framer Motion`'s `AnimatePresence`). This allows users to focus on specific sections while maintaining high-level structural awareness without sidebar clutter.
- **Contextual HUD Pattern**: For document-specific utility controls (like Zoom or Page Navigation), use a semi-transparent floating HUD (`backdrop-blur-xl`, `bg-background/60`) at the bottom-center. This keeps the primary toolbars clean and ensures actions are always within reach of the focus area.
- **Dialog-to-Sidebar Migration**: For item-level AI actions (like Chapter Tools or Section Context), prefer native sidebar tabs over modal dialogs. This "Contextual Sidebar" pattern maintains the user's flow and provides a faster, more integrated editing experience.
- **Action Bar Segmentation**: When building high-density action bars (like session controls), group related buttons (e.g., File Ops vs. Persistence) and separate them with subtle vertical dividers. This improves visual scanning and reduces cognitive load.
- **Dynamic Action Highlighting**: Use conditional styling to emphasize primary actions when they are most relevant (e.g., highlighting the "Save" button only when unsaved changes exist). This provides intuitive guidance without needing explicit alerts.
- **Manifest Design Pattern**: For complex multi-step processes (Export, Build, Library), use a "Manifest" dialog layout: a technical header with a pulse icon, a clear data hierarchy in the body (often split into 2 columns), and a professional footer with versioning. This establishes a "Production Grade" feel for critical operations.
- **Micro-Typography for technical clarity**: Use bold uppercase tracking (`tracking-widest`) for technical labels and primary-tinted badges for counts/states. This creates a high-trust "Tool" environment.
- **Immersive Branding**: Integrate brand identity through specialized containers (e.g., logo HUDs), animated status pulses, and glass-morphism effects. Avoid standard "Website" styles in favor of "Intelligence Suite" aesthetics.
- **Manifest Workspace Architecture**: For standalone tools (Summarizer, Researcher, Text Stylist, Document Writer, Blueprint, Quiz), use a wide-format manifest card with a sticky technical header, a side setup panel (400-450px), and a high-fidelity results canvas with radial dot grids and shadow-inner effects.
- **Recursive Synthesis HUD**: In comparison or tuning views (like Text Stylist), implement a floating glass-morphism HUD for switching between Logic Diffs, Comparisons, and Source Contexts.
- **High-Fidelity Document Canvas**: Stylize document previews (A4 pages) with massive shadow rings, page-edge decorations, and high-end serif typography (`serif 15px` with `leading-relaxed`) to ensure a premium reading and editing experience.
- **Activity Pulsing**: Use animated pulse indicators (green for live preview, primary for compilation) to signal asynchronous AI activity and system readiness, reinforcing the "Intelligent" nature of the suite.
- **Immersive Branding**: Integrate brand identity through specialized containers (e.g., logo HUDs), animated status pulses, and glass-morphism effects. Avoid standard "Website" styles in favor of "Intelligence Suite" aesthetics.
- **Manifest Design Pattern**: For complex multi-step processes (Export, Build, Library, TOC Architect, RAG Ingestion), use a "Manifest" dialog layout: a technical header with a pulse icon, a clear data hierarchy in the body (often split into 2 columns), and a professional footer with versioning. This establishes a "Production Grade" feel for critical operations.
- **3-Zone Manifest Layout**: For complex production dialogs (e.g., Export), utilize a 3-zone architecture: a persistent manifest header, a primary selection grid (e.g., Content Vectors), and a secondary parameter configuration zone.
- **High-Trust Persistence Feedback**: Use animated pulses and background transitions on persistence controls (like "Save") to provide immediate, high-trust confirmation of state synchronization.
- **Architectural Node List Pattern**: Style item lists (Snapshots, Sections) with left-side architectural lines and subtle `translate-x` transitions to reinforce the "Intelligence Suite" tactile feel.
- **Stable Versioning Footers**: Standardize manifest footers with "Stable Version" metadata and consistent button alignments to establish a professional, production-ready environment.
- **Isolated Modules and Decorators**: In classes using `tsyringe` decorators (like `@injectable()`), always import domain interfaces using `import type` (e.g., `import { type IUserRepository } ...`). This prevents "type referenced in a decorated signature" errors when `isolatedModules` and `emitDecoratorMetadata` are enabled.
- **Refactoring Method Signatures**: When changing a controller or service method signature, immediately perform a global search (`grep`) for all call sites (especially in API routes and hooks). Typecheck errors like "Expected X arguments, but got Y" are often numerous and tedious to fix one-by-one if calls are not updated in the same pass.
- **Options-based API Client Pattern**: When refactoring API clients (e.g., during a DB migration), prefer using a single "options" object for method arguments instead of multiple positional parameters. This makes signatures more extensible and prevents common "expected X arguments but got Y" errors during large refactors.
- **Unified Markdown Editing**: When editing multi-entity projects (Chapters, Sections), use a single `MarkdownEditor` instance for the entire project instead of fragmented per-section editors. This provides a smoother, professional writing experience. Use `project.fullMarkdownContent` for serialization and `updateProjectFromMarkdown` for deserialization.
- **Smart Editor Synchronization**: In Tiptap-based editors, only update content from props (`setContent`) when the change is external (e.g., `!editor.isFocused`). This prevents cursor jumping and race conditions during active typing while keeping the store in sync.
- **Hybrid Preview/Edit Pattern**: Maintain a structural `MarkdownViewer` map for "Preview Mode" while using a unified editor for "Edit Mode". This balances the need for a hierarchical review with the flexibility of a cohesive document editor.
- **Clean Component Integration**: Ensure shared components like `MarkdownViewer` support optional flags (e.g., `noScroll`) to integrate seamlessly into high-fidelity canvas layouts like `A4Page` without redundant scrollbars or UI clutter.
- **Backend-Agnostic API Clients**: When moving to cookie-based authentication, refactor all API clients to remove explicit `token` parameters simultaneously. This prevents "Missing token" (401) errors in the frontend. Ensure every method returns a `Result<T, ApiError>` for consistent error handling in TanStack Query hooks.
- **Type Mismatch Cleanup**: After removing properties from shared utilities (like `firebaseUser` from `apiService`), perform a project-wide search to remove stale property passing in components and hooks to avoid "Property does not exist on type" errors.
- **Query Key Factory Completeness**: Before refactoring a large set of hooks, verify that the `src/lib/query-keys.ts` factory includes all required patterns (especially `lists(type)` and `detail(type, id)` for varied entities). Missing keys are a common cause of build-time failures during architectural shifts.
- **Preserving Domain Logic**: During full-file overwrites of domain entities (e.g., `User.ts`), ensure utility methods like `getInitials()` or `getFormattedDate()` are preserved. These are often missed if the focus is purely on schema/property updates.
- **Entity Instantiation in Repositories**: In SQLite repositories, always return full domain entity instances (e.g., `new User(data)`) instead of raw database objects. This ensures frontend components can access essential utility methods like `getFormattedDate()` and `getInitials()` without manual casting or re-instantiation.
- **Class Import Awareness**: When a component needs to instantiate a domain entity (e.g., `new Transaction(t)`), ensure the class is imported as a value, not just a type. Using `import type { Transaction }` will cause "Transaction cannot be used as a value" errors when attempting to call the constructor.
- **Type Mismatch Cleanup**: After removing properties from shared utilities (like `firebaseUser` from `apiService`), perform a project-wide search to remove stale property passing in components and hooks to avoid "Property does not exist on type" errors.
- **Defensive UI Data Handling**: Always wrap external data formatting (e.g., `new Date(createdAt)` or `formatDistanceToNow`) in defensive checks or `try-catch` blocks. This prevents runtime crashes (like `Invalid time value`) if the backend returns malformed data or if a hook is temporarily using a placeholder.
- **Admin UI Guards**: When adding administrative features to shared/global components (like the Notification Dropdown or Header), always wrap them in explicit role checks (e.g., `userProfile?.role === 'admin'`) to ensure they are hidden from standard users.
- **SQLite Transaction Pattern**: In `better-sqlite3`, transactions are synchronous. When using Drizzle's `db.transaction()`, use synchronous methods (`.get()`, `.run()`, `.all()`) inside the block. Avoid `await` for inner queries to ensure consistent transaction behavior and prevent "transaction already in progress" errors.
- **Global Singleton Pattern**: Long-lived services (SQLite, Genkit) must use the Global Singleton pattern (`globalThis`) in non-production environments. This prevents multiple connections and `SIGINT` listener accumulation (`MaxListenersExceededWarning`) during Next.js hot reloads.
- **Writing Tool Standardization**: Always call `useWritingTool` with a raw **tool name** (e.g., `'summarize'`) instead of a full API path. Ensure the tool name exactly matches a key in `WritingToolRegistry.ts`.
- **Atomic Credit Handling**: Credits are pre-deducted before AI flow execution to prevent balance manipulation. A refund logic must be implemented in the Use Case layer to restore credits if the AI flow fails.
- **Conversational Filler Removal**: Small models (Gemma/Phi) are prone to adding prefixes like "Sure! Here is...". The `GenkitAiService` implements an automatic `cleanAiOutput` post-processing layer to strip these before the result reaches the UI.
- **Relational Indexing**: For high-growth tables like generation logs or notifications, proactively add indices to columns used in filters or cron-job queries (e.g., `status`, `userId`, `scheduledFor`) within the Drizzle schema to maintain performance over time.
- **Removal of src/lib**: The `src/lib` directory has been completely removed. All contents have been moved to `src/infrastructure/` (generic) or `src/modules/*/` (domain-specific). Do not create new files in `src/lib`.
- **Relocated Schemas**: Zod schemas for validation now live in `src/modules/*/domain/schemas/`.
- **Relocated Exporters**: Heavy infrastructure exporters (PPTX, PDF) now live in `src/modules/templates/infrastructure/exporters/` or similar module-specific infrastructure paths.
- **Relocated Editor Logic**: Tiptap extensions and editor controllers now live in `src/modules/ai-content/infrastructure/editor/`.
- **Standardized API Service**: Always use `apiService` from `@/infrastructure/api/ApiService` for client-server communication. Ensure all methods return a `Result` object for consistent error handling.
- **Unified Result Handling**: Every Next.js route handler should follow the pattern: `const result = await controller.method(); return handle{Module}Result(result);`. This ensures a unified error structure, correct HTTP status codes, and automatic telemetry logging.
- **Next.js 15 Compatibility**: Always wrap components using `useSearchParams` in a `<Suspense>` boundary to avoid build-time errors and hydration mismatches.
- **Tailwind Content Updates**: When creating new module component directories, ensure they are added to the `content` array in `tailwind.config.ts`.
- **Import Aliases**: Always prefer absolute path aliases (`@/modules/...`, `@/infrastructure/...`) over deep relative paths (`../../../`) to maintain stability during architectural changes.
- **Foundational Logic**: Foundational utilities (e.g., `cn`, `result`, `randomId`) and cross-cutting infrastructure (e.g., `ApiService`, `api-utils`, `cache`, `i18n`, `security`) reside in `src/infrastructure/`.
- **Domain Logic Co-location**: All domain-specific logic, including utilities (e.g., `plantuml-utils`), schemas (e.g., `ProjectSchema`), and infrastructure services (e.g., `pdf-utils`), must live within its respective module under `src/modules/`.
- **Refactoring Strategy**: When performing large-scale directory moves, use a 3-pass sweep: 1) Physically move files, 2) Perform global import updates using path aliases, 3) Run `npm run typecheck` and manually resolve relative path discrepancies in deep module trees.
- **Surgical Code Updates**: For critical files with many imports (like `WritingToolRegistry` or barrel files), prefer using `create_file` with the full content over many small `sed` or `find_and_replace_code` calls. This avoids accidental corruption from overlapping regex matches.
- **Dependency Inversion for Tools**: Ensure AI tools are defined using the Genkit instance resolved from the module's service layer (`infrastructure/services/Genkit.ts`) rather than global instances to maintain architectural isolation.
- **Barrel Export Integrity**: When renaming or categorizing exports in a barrel file (like `flows/index.ts`), always cross-reference with the `WritingToolRegistry` to ensure key-function mapping remains consistent.
- **Legacy Cleanup**: The `src/lib` and `src/hooks/core` directories have been retired to eliminate architectural drift. Do not re-introduce them. All shared logic must now be categorized as either generic Infrastructure or domain-specific Module logic.
- **CSS Hygiene**: Avoid defining complex layout logic (like A4 dimensions or zoom scales) in global CSS if it's managed by React state. Prefer utility-first Tailwind classes and scoped component logic to keep `globals.css` lean and prevent orphaned styles during refactors.
- **Functional Injection for Pure Domains**: When a domain entity (e.g., `Project`) needs to perform a complex transformation that depends on infrastructure (e.g., Markdown parsing), do not import the infrastructure helper directly. Instead, pass the helper as a typed callback to the entity's method. This keeps the Domain layer free of framework/library dependencies.
- **Direct Module Imports**: Never use a monolithic `types.ts` or `index.ts` re-export file for domain entities. Components and hooks must import entities (e.g., `User`, `Project`, `Section`) directly from their respective module paths to enforce strict encapsulation and avoid circular dependencies.
- **Memoization Pitfall**: When wrapping components in `React.memo()`, explicitly import `React` from `'react'` to avoid runtime `ReferenceError` in certain build environments (like Turbopack).
- **Zustand Performance**: Always use atomic selectors (`useStore(state => state.value)`) instead of monolithic destructuring (`const { value } = useStore()`) in high-frequency components to minimize re-renders when unrelated store properties change.
- **AI Tool Registry**: The `WritingToolRegistry` (`src/modules/ai/application/services/WritingToolRegistry.ts`) maps tool names to their categorized flow implementations and schemas. When adding a new tool, register it here using the standardized function names from the flows index.
- **Infrastructure Gateway**: `GenkitAiService` acts as the primary gateway for running flows. Prefer calling flows through this service to leverage the request queue and model selector features.
- **Git Recovery**: If bulk file moves or deletions cause working tree issues, use `git show stable:<path> > <new-path>` to recover specific file contents accurately.
- **Turbopack & `server-only`**: Do NOT add `import 'server-only'` to modules that are transitively reachable from client components — even through `require()` inside a `typeof window === 'undefined'` guard. Turbopack enforces `server-only` at the module boundary and throws a hard build error. Instead, use the `typeof window === 'undefined'` guard with `require()` for server-only code, and stub Node.js built-ins (like `async_hooks`) via `turbopack.resolveAlias` in `next.config.ts`.
- **Turbopack `resolveAlias` paths**: When setting `turbopack.resolveAlias` for browser stubs in `next.config.ts`, use `path.resolve('./path/to/stub')` (absolute path via `path` module) rather than a relative string. Relative strings may not resolve correctly in Turbopack.
- **DI Container Split Anti-pattern**: Do NOT split server-only DI registrations into a separate file loaded only via `instrumentation.ts`. In Turbopack dev mode, hot-reloaded API routes resolve from the container before `instrumentation.ts` re-runs, causing "unregistered dependency token" errors. Keep all registrations in `container.ts` using `typeof window === 'undefined'` + `require()` — this runs synchronously whenever the module is loaded on the server, with no timing race.
- **Genkit Duplicate Prompt Warning**: The `ERROR: /prompt/X already has an entry in the registry. Overwriting.` warning in dev is a Genkit hot-reload artifact — not a real error. It occurs when the dev server re-evaluates modules that call `ai.definePrompt()`. It is harmless and can be ignored.
- **Git Corrupt History Recovery**: When `git push` fails due to missing/corrupted objects deep in history, create `.git/shallow` containing the SHA of the last accessible commit. This tells git to treat that commit as a root (no parents), allowing push of all accessible history without the missing objects.

