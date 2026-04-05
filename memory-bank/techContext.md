# Technical Context - Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15**: React-based full-stack framework.
- **React 19**: Standardized top-level hook placement for stable concurrent rendering.
- **TypeScript**: Strict-mode type safety with 100% compliance verified via `tsc`.

### AI Integration
- **Google Genkit**: Core AI orchestration framework.
- **Ollama**: Local neural inference cluster.
- **Result Pattern**: Uniform `Result<T, E>` return vectors for all flows.
- **Telemetry**: High-precision timing instrumentation for all retrieval phases.

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
