# Technical Context - Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15**: React-based full-stack framework.
- **React 19**: Standardized top-level hook placement for stable concurrent rendering.
- **TypeScript**: Strict-mode type safety with mandatory `unknown` narrowing.

### AI Integration
- **Google Genkit**: Core AI orchestration framework.
- **Result Pattern**: Uniform `Result<T, E>` return vectors for all flows.
- **Clean AI Output**: Global utility for stripping model artifacts and markdown artifacts.
- **Tiered Fallback**: Automated model degradation (Llama -> Phi -> Gemma) for 8GB stability.

### Backend Services
- **Database**: SQLite with Drizzle ORM.
- **Vector Database**: Qdrant (`arkan_vectors` collection, 768 dims).
- **File Storage**: Local filesystem (`storage/uploads`) with traversal protection.

### UI Framework
- **shadcn/ui**: Built on Radix UI and Tailwind CSS.
- **Intelligence Suite Aesthetic**: High-density typography, technical grids, and pulsing status nodes.

## Architecture Patterns

### Dependency Injection (DI)
- **tsyringe**: Registered in `container.ts`.
- **"use server" Constraints**: Strict isolation of infrastructure classes from server action directives to prevent Next.js 15 class-export errors.
- **Bridging Pattern**: API Client proxies for browser-side DI resolution.

### RAG Architecture
- **Indexing & Retrieval**: Multi-layer LRU cache for embeddings and search results.

### Security Architecture
- **Auth Node**: Local JWT-based sessions with Bcrypt hashing and Jose token management.
- **Hardware Fingerprinting**: Async hardware profiling during identity creation.
- **Guard Node**: Robust optimistic rollback for security parameter synchronization.

## Performance Optimization
- **Atomic State Transformations**: Single-pass store mutations to prevent virtual DOM overhead.
- **Component Memoization**: Extensive use of `React.memo` for workspace components.
- **Code Splitting**: Automatic per-route splitting with Next.js Image optimization.
