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
*   **Safety & Output**: Flows must return `Result<T, E>` objects to provide explicit success/failure vectors to the UI. The `cleanAiOutput` utility function should be used to strip extraneous conversational elements and markdown code blocks.
*   **Validation**: Every flow must start with a `safeParse` boundary check using the relevant `InputSchema` to prevent malformed ingestion.
*   **Consistency**: Adherence to `MODEL_BY_TASK` constants is mandatory for all AI calls to maintain uniformity across conversion, reporting, and academic tasks.

## State Management & Robustness

### Atomic State Updates

*   **Batching**: For multi-node updates (e.g., bulk context mapping), operations must be batched within a single `updateProject` callback. This is typically achieved using functional reduction (e.g., `targets.reduce(...)`) or mapping passes to guarantee atomicity and prevent race conditions.
*   **Selection Recovery**: Structural changes, particularly deletions, must trigger corresponding callbacks (e.g., `onSelectChapter(null)`) or "Selection Recovery" sweeps to clear workspace focus. This prevents orphaned UI states and ensures data integrity.

### Defensive Programming

*   **Hook Compliance**: All hooks (including `useMemo`, `useCallback`, and `useAiActions`) must be placed at the top level of a component, *before* any conditional rendering or early returns. This is a strict requirement for React 19 stability.
*   **Existence Guards**: Unified `if (!project)` or `if (!userProfile)` guards must be applied to all interaction and lifecycle handlers to handle partial hydration and rapid state shifts.
*   **Error Containment**: Mutations, external service calls (export, generation), and complex async pipelines (file reading, TOC parsing) must be wrapped in `try-catch` blocks. High-fidelity UI feedback (toast, error badges, Error Boundaries) must be provided.
*   **Optimistic Sync**: When using optimistic updates (e.g., security toggles), a robust rollback logic must be implemented to restore consistent state if the API vector fails.
*   **ID Standardization**: The `@/infrastructure/utils/randomId` utility must be used exclusively for generating entity IDs. Avoid using `uuidv4` or timestamps to ensure consistency across snapshots and persistence cycles.

## Coding & UI Standards

*   **TypeScript**: The project enforces a strict TypeScript policy with zero tolerance for the `any` type. Use `unknown` and implement proper narrowing techniques, including explicit `instanceof` guards for domain entities (e.g., `item instanceof Chapter`).
*   **Components**: Server Components are the default. For high-frequency workspace components, `React.memo` should be used to optimize performance. Interaction components must handle `disabled` states correctly during async processing.
*   **Styling**: Tailwind CSS is the standard. The "Intelligence Suite" aesthetic requires specific styling: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), glassmorphism, and "Stable Manifest" footers with version indices.
*   **API Responses**: All API responses must be standardized by utilizing the `handle*Result` functions located in `src/infrastructure/api/api-utils.ts`.

## RAG & Infrastructure

*   **Vector Store**: The project utilizes Qdrant as its vector store, with a collection named `arkan_vectors` and dimensions set to 768.
*   **Storage**: Local file storage is managed via `storage/uploads/`. Robust path-traversal protection is a mandatory security requirement for this directory.
*   **Internationalization (i18n)**: Support for both Left-to-Right (LTR) and Right-to-Left (RTL) layouts is provided through the `LanguageDirectionManager`. Ensure all ARIA labels and tooltips are localized.

---

## Change Log

*   **System-Wide Hardening**: Standardized "Defensive Programming" and "Atomic Batching" across 30+ components including Generation, Source, Outline, Billing, and Profile modules.
*   **Neural Infrastructure Refined**: Migrated core AI flows to the `Result<T, E>` pattern and integrated spectral cleanup via `cleanAiOutput`. Added `safeParse` validation to all Genkit flows.
*   **Hook Optimization**: Audited and refactored core HUD panels to ensure strict compliance with React 19 hook placement rules.
*   **Existence Guards & Optimistic Sync**: Introduced mandatory existence guards for component handlers and rollback logic for optimistic UI updates.
*   **Identity Consistency**: Verified the move to a unified ID strategy using `randomId` for all document and source nodes.
*   **Visual Refinement**: Consolidated the "Intelligence Suite" aesthetic across all production-grade HUDs and manifest footers, incorporating glassmorphism and version indices.
*   **i18n Enhancement**: Ensured all ARIA labels and tooltips are localized for RTL support.
