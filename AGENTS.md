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

## Architecture & Logic

### Clean Architecture (DDD)

Modules within `src/modules/` adhere to a four-layer structure:

1.  **`domain/`**: Contains pure entities, repository interfaces, and Zod schemas. This layer is free from external dependencies.
2.  **`application/`**: Houses use cases that orchestrate domain logic.
3.  **`adapters/`**: Includes API clients, controllers, and localized Zustand stores, acting as bridges to external services.
4.  **`infrastructure/`**: Provides concrete implementations for services like Genkit, SQLite/Drizzle, and Qdrant.

### Dependency Injection (DI) & Execution Boundaries

The project utilizes `tsyringe` for dependency injection.

*   **Registration**: Services are registered in `src/infrastructure/di/container.ts`.
*   **Cross-Environment Bridging**: For services that must be triggered from the client but executed on the server (e.g., Document Export), implement a "Bridging Pattern". Register a client-side API client (e.g., `ExportApiClient`) for browser environments and the full infrastructure implementation for the server. This maintains a unified interface while respecting Next.js 15 boundaries.
*   **Browser-Only Dynamic Synthesis**: Libraries with mandatory DOM dependencies (e.g., `pptxgenjs`) MUST be moved entirely to client hooks using dynamic `import()` to prevent server-side reference errors (`document is not defined`) during module initialization.

### Server Actions & "use server" Constraints

*   **Logic Isolation**: The `"use server"` directive should be applied to specific async functions (Actions) or dedicated action files, *not* to classes or infrastructure services.
*   **Class Restriction**: Exporting classes from a `"use server"` file is prohibited if they contain non-async properties or methods. Infrastructure services should remain directive-free and be consumed by Actions or API Routes.

### AI & Genkit Flows

*   **Implementation**: All AI-related flows are located in `src/modules/ai/infrastructure/flows/` and are prefixed with `'use server'`.
*   **Safety & Output**: Flows must return `Result<T, E>` objects to provide explicit success/failure vectors.
*   **Spectral Sanitization**: The `cleanAiOutput` utility function MUST be used to strip extraneous conversational elements and markdown code blocks before committing AI text to the domain.
*   **Neural Telemetry**: Instrument retrieval flows with high-precision timing (`performance.now()`) and transmit via a `telemetry` field in result objects to enable real-time monitoring of pipeline stages (Embedding, Search, Rerank).

## State Management & Robustness

### Atomic State Updates

*   **Batching Pattern**: For multi-node updates (e.g., bulk context mapping), operations must be batched within a single `updateProject` callback. Use functional reduction: `targets.reduce((p, id) => p.updateSection(id, s => s.withProps(...)), currentProject)`. This guarantees atomicity and prevents race conditions.
*   **Selection Recovery**: Structural changes, particularly deletions, must trigger corresponding callbacks (e.g., `onSelectChapter(null)`) or "Selection Recovery" sweeps to clear workspace focus.

### Defensive Programming

*   **Hook Compliance**: All hooks must be placed at the top level of a component, *before* any conditional rendering or early returns. This is a strict requirement for React 19 stability.
*   **Existence Guards**: Unified `if (!project)` or `if (!userProfile)` guards must be applied to all interaction and lifecycle handlers.
*   **Error Containment**: Mutations and external service calls must be wrapped in `try-catch` blocks. Use localized Error Boundaries for high-risk rendering pipelines (e.g., `DocumentRenderer`).
*   **Status Vector Pattern**: Utilize unified `status` union types (e.g., `'loading' | 'authenticated' | 'error'`) in Context providers instead of multiple boolean flags to ensure predictable UI transitions.
*   **asChild Constraint**: Components using the `asChild` pattern (e.g., `Button`) MUST have exactly one direct React element child. Decorative siblings (whitespace, text nodes, icons) must be wrapped or moved outside.
*   **ID Standardization**: The `@/infrastructure/utils/randomId` utility must be used exclusively for generating entity IDs.

## Coding & UI Standards

*   **TypeScript**: Strict policy with zero tolerance for the `any` type. Use `unknown` and explicit type guards.
*   **Form Persistence Purity**: When updating domain entities from form state, implement selective property mapping to prevent `undefined` or `null` form values from polluting the domain manifest.
*   **Prop Standardization**: Standardize core workspace callbacks as `onActiveChapterChange` and `onActiveSectionChange`.
*   **Styling**: Tailwind CSS is the standard. The "Intelligence Suite" aesthetic requires: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), glassmorphism, and "Stable Manifest" footers.

## RAG & Infrastructure Performance

*   **Vector Store Lazy Init**: Use a singleton `initPromise` pattern in vector store adapters (e.g., `QdrantVectorStore`) to avoid redundant connection/collection verification overhead.
*   **Cache Key Optimization**: Utilize bitwise string hashing for high-frequency cache keys (e.g., `EmbeddingCache`) to minimize string concatenation overhead.
*   **Heuristic Fallbacks**: For server-side operations requiring browser metrics (e.g., text measurement for layout), implement weighted character-based heuristics that account for script density (e.g., Arabic vs. Latin).

---

## Change Log

*   **Global Robustness Hardening**: Standardized "Defensive Programming" and "Atomic Batching" across 60+ components including Generation, Export, Source, Outline, Profile, and Admin Dashboard modules.
*   **Auth & Layout Transformation**: Hardened `AuthContext` with a unified status vector and established the "Intelligence Suite" aesthetic in the global `Header`.
*   **RAG Performance & Telemetry**: Overhauled the retrieval pipeline for sub-100ms latency. Implemented bitwise hashing, lazy initialization, and high-precision telemetry dashboards.
*   **Infrastructure Boundaries**: Resolved Next.js 15 class-export errors and implemented the "Client-Server DI Bridging" pattern for document exports.
*   **Neural Rendering Stabilized**: Implemented a dedicated `RendererErrorBoundary` and stabilized the A4 rendering pipeline with hydration guards.
*   **Identity Consistency**: Verified the move to a unified ID strategy using `randomId` for all document, source, and identity nodes.
