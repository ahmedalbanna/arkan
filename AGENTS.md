# Arkan Project Guide

## Overview

Arkan is an AI-powered platform for academic and professional writing. It is built using Next.js 15, TypeScript (strict mode), and Google Genkit, strictly adhering to Clean Architecture (DDD) principles for a clear separation of business logic and infrastructure.

## Subagents: Specialist Delegation

Tasks can be delegated to specialized agents located in `.rovodev/subagents/` using the `invoke_subagents` tool. This allows for modular development and specialization.

### Delegation Matrix

| Subagent                     | Primary Use Cases                                    |
| :--------------------------- | :--------------------------------------------------- |
| Next.js 15 AI/Server Actions | App Router, data fetching, `use server` patterns, Genkit flows. |
| shadcn/ui Builder            | UI components, Radix primitives, CVA, accessibility.   |
| Data Table/Dashboard         | Admin dashboards, TanStack Table, Recharts.          |
| Real-time/WebSocket          | SSE, WebSockets, streaming endpoints.                |
| State Management             | Zustand stores (`useBuilderStore`), state architecture.   |
| Bug Hunter                   | Reproducing bugs, analyzing `errors.txt`, detailed reporting. |
| Code Review/Best Practices   | Security audits, refactoring, code quality, consistency. |
| Scalability Advisor          | RAG/Qdrant optimization, API bottleneck analysis.    |

A common pattern for delegating new features is to split tasks among: **AI Dev** (for core logic), **shadcn/ui** (for component implementation), and **Server Actions** (for form handling).

## Architecture & Logic

### Clean Architecture (DDD)

Modules within `src/modules/` adhere to a four-layer structure:

1.  **`domain/`**: Contains pure entities, repository interfaces, and Zod schemas. This layer is free from external dependencies.
2.  **`application/`**: Houses use cases that orchestrate domain logic.
3.  **`adapters/`**: Includes API clients, controllers, and localized Zustand stores, acting as bridges to external services.
4.  **`infrastructure/`**: Provides concrete implementations for services like Genkit, SQLite/Drizzle, and Qdrant.

### Dependency Injection (DI)

The project utilizes `tsyringe` for dependency injection.

*   **Registration**: Services are registered using `@injectable()` and `@inject()` decorators, with all registrations centralized in `src/infrastructure/di/container.ts`.
*   **Server-Only Enforcement**: To prevent client-side contamination, server-only modules are loaded using `require()` within a `typeof window === 'undefined'` check in `container.ts`.
*   **Resolution**: Services should not be instantiated directly using `new`. Instead, resolve them using the `useService(token)` hook.

### AI & Genkit Flows

*   **Implementation**: All AI-related flows are located in `src/modules/ai/infrastructure/flows/` and are prefixed with `'use server'`.
*   **Safety & Output**: To ensure safe and predictable AI output, use `Result<T, E>` objects and access their values via `.getValue()`. The `cleanAiOutput` utility function should be used to strip extraneous conversational elements.
*   **Consistency**: Adherence to `MODEL_BY_TASK` constants is mandatory for all AI calls to maintain uniformity.

## State Management & Robustness

### Atomic State Updates

*   **Batching**: For multi-node updates (e.g., bulk context mapping), operations must be batched within a single `updateProject` callback. This is typically achieved using functional reduction (e.g., `targets.reduce(...)`) to guarantee atomicity.
*   **Selection Recovery**: Structural changes, particularly deletions, must trigger corresponding callbacks (e.g., `onSelectChapter(null)`) to clear workspace focus. This prevents orphaned UI states and ensures data integrity.

### Defensive Programming

*   **Hook Compliance**: All hooks (including `useMemo`, `useCallback`, and `useAiActions`) must be placed at the top level of a component, *before* any conditional rendering or early returns. This is a strict requirement for React 19 stability.
*   **Error Handling & Persistence**: Mutations and external service calls (e.g., export, generation) must be wrapped in `try-catch` blocks. Explicit UI feedback, such as toast notifications, should be provided to the user in case of errors.
*   **ID Standardization**: The `@/infrastructure/utils/randomId` utility must be used exclusively for generating entity IDs. Avoid using `uuidv4` or timestamps for this purpose.

## Coding & UI Standards

*   **TypeScript**: The project enforces a strict TypeScript policy with zero tolerance for the `any` type. Use `unknown` and implement proper narrowing techniques, including explicit `instanceof` guards for domain entities.
*   **Components**: Server Components are the default. For high-frequency workspace components, `React.memo` should be used to optimize performance.
*   **Styling**: Tailwind CSS is the standard. The "Intelligence Suite" aesthetic requires specific styling: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), and "Stable Manifest" footers.
*   **API Responses**: All API responses must be standardized by utilizing the `handle*Result` functions located in `src/infrastructure/api/api-utils.ts`.

## RAG & Infrastructure

*   **Vector Store**: The project utilizes Qdrant as its vector store, with a collection named `arkan_vectors` and dimensions set to 768.
*   **Storage**: Local file storage is managed via `storage/uploads/`. Robust path-traversal protection is a mandatory security requirement for this directory.
*   **Internationalization (i18n)**: Support for both Left-to-Right (LTR) and Right-to-Left (RTL) layouts is provided through the `LanguageDirectionManager`.

---

## Change Log

*   **Consolidation**: The "Robustness & State Patterns" section has been integrated into the core "Architecture & Logic" and "State Management & Robustness" sections for a more cohesive structure.
*   **Deduplication**: Redundant descriptions of folder structures and repeated emphasis on `instanceof` guards and the `randomId` utility have been removed.
*   **Structure**: Technical requirements have been logically grouped into distinct sections: "Architecture & Logic," "State Management & Robustness," "Coding & UI Standards," and "RAG & Infrastructure."
*   **Refinement**: Phrasing related to Hook compliance and ID standardization has been tightened to reflect authoritative development requirements.