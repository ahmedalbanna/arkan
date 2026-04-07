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
3.  **`adapters/`**: Acts as a bridge to external systems and the UI. It is subdivided into:
    *   **`controllers/`**: (Server) Mediators that inject use cases and are consumed by API routes.
    *   **`hooks/`**: (Client) React hooks (Query/Mutation) for data lifecycle and UI orchestration.
    *   **`state/`**: (Client) Localized Zustand stores for ephemeral UI state (e.g., editor selection, panel visibility).
    *   **`api-client/`**: (Client) Services used by hooks to communicate with server-side API routes.
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

The project's AI capabilities are managed through a flexible orchestration layer, allowing seamless integration of local Genkit flows or external services like n8n.

*   **AI Core Location**: AI flows are primarily located in `src/modules/ai/infrastructure/flows/`.
*   **Infrastructure Interchangeability**: The system supports swapping the internal AI engine (Genkit/Ollama) with external orchestrators like **n8n** via the `IAiService` interface. This allows for offloading complex logic to dedicated automation servers.
*   **Active AI Engine Configuration**: The application defaults to `GenkitAiService`. However, if the `N8N_AI_WEBHOOK_URL` environment variable is set, the `N8nAiService` is automatically registered and activated in the DI container (`src/infrastructure/di/container.ts`).
*   **n8n Integration Pattern**: The `N8nAiService` utilizes a webhook-based bridging strategy for communication. Payloads transmitted to n8n must include `action`, `prompt`, and optional `flowName`/`input` fields. n8n is expected to return a JSON response with a top-level `text` field and a `success` boolean.
*   **n8n AI Stack & Workflow**: The live n8n workflow (`uduvS9JJKfnunoyv` on `vmi2935537.contaboserver.net`) is configured as follows:
    *   **LLM**: OpenRouter (`openrouter/auto`) for all agent reasoning.
    *   **Embeddings**: Ollama (`nomic-embed-text:latest`) for vector search.
    *   **Vector Store**: Qdrant (`arkan_vectors` collection) for RAG retrieval.
    *   **Tools**: Wikipedia, Calculator, and Vector Store Retriever.
*   **n8n Action Routing & Specialized Agents**: The n8n workflow routes requests based on the `action` field, with supported actions including `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, and `generateSectionWithRAG`. Each action maps to a dedicated agent or code node. For `generateText` with a `flowName`, a secondary Switch node ("Route Flow") directs to 32 specialized agents, all connected to the `OpenRouter Chat Model`. Unknown flowNames fall back to the general Arkan AI Agent.
    *   **Writing Agents**: `summarize`, `grammarCheck`, `paraphrase`, `humanize`, `translate`, `proofreadDocument`, `rewriteToMarkdown`, `improveMarkdown`.
    *   **Analysis Agents**: `biasCheck`, `detectAi`, `factCheck`, `plagiarismCheck`, `sentenceStructureCheck`, `analyzeContext`, `checkPaperQuality`.
    *   **Academic Agents**: `quiz`, `generateCitation`, `generateTOC`, `generateLitReview`, `generateLecture`, `solveAssignments`, `explainTopic`.
    *   **Research Agents**: `aiResearch`, `generateIdeas`.
    *   **Generation Agents**: `generateUIDescription`, `generateSessionPlan`, `generateProjectBlueprint`, `generateProjectDoc`, `writeTechSpec`, `createPresentation`.
    *   **Media Agents**: `generatePlantUML`, `imageToText`.
*   **n8n Protocol & Mapping**: To synchronize naming conventions, the UI/Registry uses `kebab-case` IDs (e.g., `grammar-checker`), while the n8n workflow expects `camelCase` agents (e.g., `grammarCheck`). The `N8N_FLOW_MAP` in `N8nAiService.ts` maintains an explicit mapping to prevent silent fallbacks to local Genkit flows.
*   **n8n Robustness & Timeouts**: Workflows include an "Error Trigger" linked to a "Respond to Webhook" node for structured error messages (`{"success": false, "error": "..."}`). RAG-enhanced generations, often exceeding standard API limits, utilize a 5-minute (300s) timeout in `N8nAiService` to accommodate deep retrieval and multi-agent processing within n8n.
*   **RAG-Enhanced Endpoints**: Dedicated API routes (`/api/generate/chapter-rag`, `/api/generate/section-rag`) bypass local AIGenkit flows to directly invoke n8n RAG agents with full project context.
*   **n8n Connection Architecture**: Each specialized agent requires three specific connections: (1) `Route Flow` -> Agent (main), (2) `OpenRouter Chat Model` -> Agent (ai_languageModel), and (3) Agent -> `Prepare Response` (main). Missing any connection leads to silent failures.
*   **n8n API Deployment Standards**: When updating workflows via the n8n Public API (`PUT /workflows/:id`), the JSON body must strictly contain only schema-valid keys (`name`, `nodes`, `connections`, `settings`). Including properties like `id`, `versionId`, `meta`, or `pinData` will result in a 400 error.
*   **Safety & Output**: All generation methods and flows must return `Result<T, E>` objects to provide explicit success/failure vectors to the UI.
*   **Spectral Sanitization**: The `cleanAiOutput` utility function MUST be used to strip extraneous conversational elements (e.g., "Here is the content:") and markdown code blocks before committing AI text to the domain.
*   **Neural Telemetry**: Instrument retrieval flows with high-precision timing (`performance.now()`) and transmit via a `telemetry` field in result objects to enable real-time monitoring of pipeline stages (Embedding, Search, Rerank).

## State Management & Robustness

### Atomic State Updates

*   **Batching Pattern**: For multi-node updates (e.g., bulk context mapping), operations must be batched within a single `updateProject` callback. Use functional reduction: `targets.reduce((p, id) => p.updateSection(id, s => s.withProps(...)), currentProject)`. This guarantees atomicity and prevents race conditions.
*   **Selection Recovery**: Structural changes, particularly deletions, must trigger corresponding callbacks (e.g., `onSelectChapter(null)`) or "Selection Recovery" sweeps to clear workspace focus. This prevents orphaned UI states where the system tries to render a deleted node.

### Defensive Programming

*   **Hook Compliance**: All hooks (including `useMemo`, `useCallback`, and `useAiActions`) must be placed at the top level of a component, *before* any conditional rendering or early returns. This is a strict requirement for React 19 stability.
*   **Existence Guards**: Unified `if (!project)` or `if (!userProfile)` guards must be applied to all interaction and lifecycle handlers to handle partial hydration and rapid state shifts.
*   **Error Containment**: Mutations, external service calls (export, generation), and complex async pipelines (file reading, TOC parsing) must be wrapped in `try-catch` blocks. Use localized Error Boundaries for high-risk rendering pipelines (e.g., `DocumentRenderer`).
*   **Status Vector Pattern**: Utilize unified `status` union types (e.g., `'loading' | 'authenticated' | 'error'`) in Context providers instead of multiple boolean flags to ensure predictable UI transitions.
*   **asChild Constraint**: Components using the `asChild` pattern (e.g., `Button`) MUST have exactly one direct React element child. Decorative siblings (whitespace, text nodes, icons) must be wrapped or moved outside.
*   **ID Standardization**: The `@/infrastructure/utils/randomId` utility must be used exclusively for generating entity IDs. Avoid using `uuidv4` or timestamps to ensure consistency across snapshots and persistence cycles.

## Coding & UI Standards

*   **TypeScript**: The project enforces a strict TypeScript policy with zero tolerance for the `any` type. Use `unknown` and implement proper narrowing techniques, including explicit `instanceof` guards for domain entities (e.g., `item instanceof Chapter`).
*   **Form Persistence Purity**: When updating domain entities from form state, implement selective property mapping to prevent `undefined` or `null` form values from polluting the domain manifest.
*   **Prop Standardization**: Standardize core workspace callbacks as `onActiveNodeChange` across the component tree to ensure type consistency and predictable structural shifts. This includes `onActiveChapterChange` and `onActiveSectionChange` where applicable.
*   **Components**: Server Components are the default. For high-frequency workspace components, `React.memo` should be used to optimize performance. Interaction components must handle `disabled` states correctly during async processing.
*   **Styling**: Tailwind CSS is the standard. The "Intelligence Suite" aesthetic requires specific styling: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), glassmorphism, and "Stable Manifest" footers with version indices.
*   **API Responses**: All API responses must be standardized by utilizing the `handle*Result` functions located in `src/infrastructure/api/api-utils.ts`.

## RAG & Infrastructure Performance

*   **Vector Store Lazy Initialization**: Use a singleton `initPromise` pattern in vector store adapters (e.g., `QdrantVectorStore`) to avoid redundant connection/collection verification overhead during initialization.
*   **Cache Key Optimization**: Utilize bitwise string hashing for high-frequency cache keys (e.g., `EmbeddingCache`) to minimize string concatenation overhead and improve lookup performance.
*   **Heuristic Fallbacks for Browser Metrics**: For server-side operations requiring browser metrics (e.g., text measurement for layout), implement weighted character-based heuristics that account for script density (e.g., Arabic vs. Latin) to provide reasonable approximations.
*   **Internationalization (i18n)**: Support for both Left-to-Right (LTR) and Right-to-Left (RTL) layouts is provided through the `LanguageDirectionManager`. Ensure all ARIA labels and tooltips are localized.

---

## Change Log

*   **Global Robustness Hardening**: Standardized "Defensive Programming" and "Atomic Batching" across 60+ components including Generation, Export, Source, Outline, Profile, and Admin Dashboard modules.
*   **Auth & Layout Transformation**: Hardened `AuthContext` with a unified status vector. Established the "Intelligence Suite" aesthetic in the global `Header`.
*   **RAG Performance & Telemetry**: Overhauled the retrieval pipeline for sub-100ms latency. Implemented bitwise hashing for cache keys, lazy initialization for vector stores, and high-precision telemetry for pipeline stage monitoring.
*   **Infrastructure Boundaries**: Resolved Next.js 15 class-export errors by prohibiting class exports from `"use server"` files and implementing the "Client-Server DI Bridging" pattern for document exports. Browser-only libraries are now handled via dynamic `import()`.
*   **Neural Rendering Stabilized**: Implemented a dedicated `RendererErrorBoundary`, along with hydration guards. Stabilized the A4 rendering pipeline.
*   **Identity Consistency**: Verified the move to a unified ID strategy using `randomId` for all document, source, and identity nodes.
*   **n8n Full Integration**: Fully implemented `N8nAiService.ts` as a drop-in `IAiService` replacement. The DI container now auto-selects between `N8nAiService` (when `N8N_AI_WEBHOOK_URL` is set) and `GenkitAiService` (fallback). The n8n workflow covers all 5 IAiService methods with dedicated agents and code nodes.
*   **n8n Workflow Architecture**: The "Arkan AI Integration Workflow" (`n8n_ai_workflow.json`) uses a Switch node routing 5 action types: `generateText`, `runFlow`, `retrieveContext`, `generateChapterWithRAG`, `generateSectionWithRAG`. Specialized RAG agents handle chapter and section generation with Qdrant-based retrieval.
*   **n8n Protocol Hardening**: Synchronized naming conventions across 32 specialized agents. Resolved a global routing mismatch by updating `N8N_FLOW_MAP` to translate Registry `kebab-case` tool IDs to n8n-native `camelCase` agent names. Ensured correct connection architecture and API deployment standards for n8n workflows.
*   **RAG UI Integration**: Implemented "Synthesize with RAG" toggles across Section and Chapter HUDs, enabling users to opt-in to enhanced retrieval-based generation via the new n8n-backed API routes. Optimized n8n timeout to 300s to support complex generation.
*   **Architecture Clarity & Standardization**: Explicitly defined the triad within the `adapters/` layer (Controllers/Hooks/State) and their respective execution boundaries (Server/Client). Standardized core workspace callbacks to `onActiveNodeChange` and enforced the `asChild` constraint.
*   **i18n Enhancement**: Ensured all ARIA labels and tooltips are localized for RTL support.