# Technical Context - Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15**: React-based full-stack framework.
- **React 19**: Standardized top-level hook placement for stable concurrent rendering.
- **TypeScript**: Strict-mode type safety with 100% compliance verified via `tsc`.

### AI Integration
- **Active Engine**: `N8nAiService` (auto-selected when `N8N_AI_WEBHOOK_URL` is set), falls back to `GenkitAiService`.
- **n8n Server**: External orchestration on `vmi2935537.contaboserver.net`. Workflow ID: `uduvS9JJKfnunoyv`.
- **n8n AI Stack**: OpenRouter (`openrouter/auto`) + Ollama Embeddings (`nomic-embed-text:latest`) + Qdrant RAG.
- **n8n Agents**: 32 specialized agents + 1 general Arkan AI Agent + 2 RAG agents (Chapter/Section).
- **Google Genkit**: Local AI orchestration framework (fallback when n8n is unavailable).
- **Ollama**: Local inference (`nomic-embed-text` for embeddings, `gemma:2b` for local fallback).
- **Result Pattern**: Uniform `Result<T, E>` return vectors for all flows. Access via `.isSuccess` and `.error`.
- **Telemetry**: High-precision `performance.now()` timing in all n8n calls and retrieval phases.

### Data & Visualization
- **Database**: SQLite with Drizzle ORM.
- **Vector Database**: Qdrant (`arkan_vectors` collection, 768 dims).
- **Analytics**: **Recharts** for real-time performance and latency tracking.

### UI Framework
- **shadcn/ui**: Built on Radix UI and Tailwind CSS.
- **Intelligence Suite Aesthetic**: High-density typography, 28px technical grids, and pulsing status nodes.

## Architecture Patterns

### Dependency Injection (DI)
- **tsyringe**: Registered in `container.ts`.
- **Bridging Pattern**: API Client proxies for browser-side DI resolution.

### RAG Architecture
- **Performance**: Sub-100ms retrieval achieved via bitwise string hashing, lazy vector store initialization, and O(N) result merging.
- **Resilience**: Hybrid reranking guards and multi-layer LRU caching for embeddings and search results.

### Security Architecture
- **Auth Node**: Local JWT-based sessions with hardware fingerprinting.
- **Transmission**: Universal use of `try-catch` blocks and structured error feedback across all procurement and authentication vectors.
