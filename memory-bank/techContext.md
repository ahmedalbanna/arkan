# Technical Context - Arkan

## Technology Stack

### Frontend Framework
- **Next.js 15**: React-based full-stack framework with App Router.
- **React 18**: Server and Client Components, concurrent features.
- **TypeScript**: Full type safety across the application.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.

### AI Integration
- **Google Genkit**: AI framework for building and deploying AI applications.
- **Generation Models**:
  - Google Gemini 2.5 Flash Lite
  - Ollama for local models (Gemma 2B, Phi-3 Mini, Llama 3 8B).
  - **Tiered Fallback**: Automated model degradation (Llama -> Phi -> Gemma) for reliability.
- **Token Management**:
  - `TokenManager`: Custom heuristic-based token counting and context truncation for local LLMs.
- **Embedding Model**:
  - Ollama with `nomic-embed-text` for RAG.
- **Zod Schemas**: Type-safe validation for all AI inputs and outputs.

### Backend Services
- **Local Infrastructure**:
  - **Database**: SQLite with Drizzle ORM for all application data.
  - **Authentication**: Local JWT-based auth with bcrypt password hashing.
  - **File Storage**: Local filesystem storage for user uploads (`storage/uploads`).
- **Qdrant**: High-performance vector database for the RAG system.

### UI Framework & Components
- **Radix UI**: Accessible, unstyled component primitives.
- **shadcn/ui**: Component library built on Radix and Tailwind.
- **Lucide Icons**: Icon library.

### State Management
- **Zustand**: Lightweight global client state (active project, UI state).
- **React Query (TanStack)**: Server state management, caching, and data synchronization.
- **Context APIs**: For authentication and localization.

## Architecture Patterns

### Code Organization (Clean Architecture)
```
src/
├── app/            # Next.js App Router pages and API routes
├── modules/        # Domain modules (Clean Architecture / DDD)
│   └── [domain]/
│       ├── domain/         # Entities, Repo Interfaces, Schemas
│       ├── application/    # Use Cases, Application Services
│       ├── adapters/       # Controllers, hooks, state, smart components
│       └── infrastructure/ # DB/External service implementations
├── components/     # Pure UI & Shared layout components
│   ├── ui/             # shadcn/Radix primitives
│   └── shared/         # Header, Footer, Providers
├── hooks/          # Generic framework/utility hooks
└── infrastructure/ # Cross-cutting concerns (API, DI, DB, Security)
```

### RAG Architecture
- **Indexing Pipeline**: Documents -> Chunking -> Ollama Embeddings -> Qdrant Storage.
- **Retrieval Pipeline**: Query -> Embedding -> Qdrant Search -> Re-ranking -> Context.
- **Caching**: Multi-layer LRU cache for embeddings and search results.

### Component Patterns
- **Server & Client Components**: Optimized rendering with Next.js App Router.
- **Compound Components**: For complex UI like the report builder.
- **Custom Hooks**: Encapsulation of business logic.

### Data Flow Patterns
- **Server Actions**: For form submissions and mutations.
- **API Routes**: For client-server communication and external integrations.
- **Optimistic Updates**: For a smoother user experience on data mutations.

## Development Environment

### Build Tools
- **Turbopack**: Fast bundler for Next.js development.
- **ESLint & Prettier**: Code linting and formatting.
- **Jest & React Testing Library**: Unit and component testing.

### Local Development
- **Docker Compose**: For running local instances of Qdrant.
- **Ollama**: For running local LLMs and embedding models.

## Security Architecture

### Authentication & Authorization
- **Local Auth (SQLite)**: Secure local authentication with JWT and bcrypt.
- **Injectable Auth Services**: `IPasswordService` and `ITokenService` for flexible implementation.
- **Cookie-Based Sessions**: Automated session management via `ICookieService`.
- **Middleware**: Route protection for authenticated and admin-only routes.
- **Role-Based Access Control (RBAC)**: 'admin' vs 'user' roles enforced on the server.
- **Client-Server SDK Decoupling**: Strict isolation of heavy AI infrastructure (Genkit, Express) from the client bundle using relocated constants and runtime guards.

### Data Security
- **Firestore Rules**: Database-level security rules.
- **Input Validation**: Zod schemas for all API inputs and AI flows.
- **Image Proxy**: Whitelisted domains for secure image fetching.

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Automatic per-route code splitting.
- **Next.js Image Optimization**: Lazy loading and optimized image formats.
- **React Server Components**: Reduced client-side JavaScript.
- **Client-side Caching**: Using React Query and Zustand to cache data and state.

### Backend Performance
- **RAG Caching**: Multi-layer caching for embeddings and search results reduces latency.
- **Qdrant Indexing**: HNSW indexing for fast vector search.
- **Firestore Indexing**: Custom indexes for efficient database queries.
- **Serverless Functions**: Scalable, on-demand backend logic.

## Deployment & Infrastructure

### Hosting
- **Contabo Hosting**: For deploying the Next.js frontend.
- **PostgreSQL**: For backend services (Auth, Firestore, Functions).
- **Self-hosted / openrouter.ai**: For running Qdrant and Ollama services.

### Environment Management
- **Environment Variables**: Centralized and validated configuration (`src/lib/config.ts`).
- `.env.example`: Template for easy setup.
