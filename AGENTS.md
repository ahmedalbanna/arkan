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

### AI & Orchestration

*   **Implementation**: AI flows are primarily located in `src/modules/ai/infrastructure/flows/`.
*   **Infrastructure Interchangeability**: The system supports swapping the internal AI engine (Genkit/Ollama) with external orchestrators like **n8n** via the `IAiService` interface. This allows for offloading complex logic to dedicated automation servers.
*   **Active AI Engine**: The application currently uses **`N8nAiService`** as its AI backend. This is registered in `src/infrastructure/di/container.ts` and is activated automatically when the `N8N_AI_WEBHOOK_URL` environment variable is set. If this variable is absent, the system falls back to `GenkitAiService`.
*   **n8n Implementation Pattern**: Utilizes a webhook-based bridging strategy. The payload transmitted to n8n must include `action`, `prompt`, and optional `flowName`/`input` fields. n8n is expected to return a JSON response with a top-level `text` field and a `success` boolean.
*   **n8n Action Routing**: The n8n workflow routes requests based on the `action` field. Supported actions: `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, `generateSectionWithRAG`. Each maps to a dedicated agent or code node in the workflow.
*   **n8n AI Stack**: The live n8n workflow (`uduvS9JJKfnunoyv` on `vmi2935537.contaboserver.net`) uses:
    *   **LLM**: OpenRouter (`openrouter/auto`) for all agent reasoning.
    *   **Embeddings**: Ollama (`nomic-embed-text:latest`) for vector search.
    *   **Vector Store**: Qdrant (`arkan_vectors` collection) for RAG retrieval.
    *   **Tools**: Wikipedia, Calculator, and Vector Store Retriever.
*   **n8n Robustness**: Workflows should include an **Error Trigger** linked to a **Respond to Webhook** node to return structured error messages (e.g., `{"success": false, "error": "..."}`) to the caller, preventing timeouts.
*   **n8n Action Routing**: The n8n workflow routes requests based on the `action` field. Supported actions: `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, `generateSectionWithRAG`. Each maps to a dedicated agent or code node in the workflow.
*   **n8n Specialized Agents**: For `generateText` with a `flowName`, a second Switch node ("Route Flow") directs to **32 specialized agents**. All 32 agents are fully wired to the `OpenRouter Chat Model` and return results via the `Prepare Response` node. Unknown flowNames fall back to the general Arkan AI Agent. Full agent list:
    *   **Writing**: `summarize`, `grammarCheck`, `paraphrase`, `humanize`, `translate`, `proofreadDocument`, `rewriteToMarkdown`, `improveMarkdown`
    *   **Analysis**: `biasCheck`, `detectAi`, `factCheck`, `plagiarismCheck`, `sentenceStructureCheck`, `analyzeContext`, `checkPaperQuality`
    *   **Academic**: `quiz`, `generateCitation`, `generateTOC`, `generateLitReview`, `generateLecture`, `solveAssignments`, `explainTopic`
    *   **Research**: `aiResearch`, `generateIdeas`
    *   **Generation**: `generateUIDescription`, `generateSessionPlan`, `generateProjectBlueprint`, `generateProjectDoc`, `writeTechSpec`, `createPresentation`
    *   **Media**: `generatePlantUML`, `imageToText`
*   **n8n Protocol Alignment**: The UI/Registry uses `kebab-case` IDs (e.g., `grammar-checker`), while the n8n workflow expects `camelCase` (e.g., `grammarCheck`). The `N8N_FLOW_MAP` in `N8nAiService.ts` must maintain an explicit mapping to prevent silent fallbacks to local Genkit flows.
*   **n8n Connection Architecture**: Each specialized agent requires 3 connections: (1) `Route Flow` → Agent (main), (2) `OpenRouter Chat Model` → Agent (ai_languageModel), (3) Agent → `Prepare Response` (main). Missing any one of these causes silent failures.
*   **n8n API Deployment**: When updating workflows via the n8n Public API (`PUT /workflows/:id`), the JSON body must strictly contain only schema-valid keys (`name`, `nodes`, `connections`, `settings`). Additional properties like `id`, `versionId`, `meta`, or `pinData` will cause a 400 error.
*   **Safety & Output**: All generation methods and flows must return `Result<T, E>` objects to provide explicit success/failure vectors.
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
*   **n8n Full Integration**: Fully implemented `N8nAiService.ts` as a drop-in `IAiService` replacement. The DI container now auto-selects between `N8nAiService` (when `N8N_AI_WEBHOOK_URL` is set) and `GenkitAiService` (fallback). The n8n workflow covers all 5 IAiService methods with dedicated agents and code nodes.
*   **n8n Workflow Architecture**: The "Arkan AI Integration Workflow" (`n8n_ai_workflow.json`) uses a Switch node routing 5 action types: `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, `generateSectionWithRAG`. Specialized RAG agents handle chapter and section generation with Qdrant-based retrieval.
*   **n8n Protocol Hardening**: Synchronized naming conventions across 32 agents. Resolved a global routing mismatch by updating `N8N_FLOW_MAP` to translate Registry `kebab-case` tool IDs to n8n-native `camelCase` agent names.
