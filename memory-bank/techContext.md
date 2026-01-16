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
- **Embedding Model**:
  - Ollama with `nomic-embed-text` for RAG.
- **Zod Schemas**: Type-safe validation for all AI inputs and outputs.

### Backend Services
- **Firebase**:
  - **Authentication**: Secure user auth with email, Google, and phone providers.
  - **Firestore**: NoSQL database for user data, projects, and metadata.
  - **Firebase Storage**: File storage for user uploads (e.g., payment proofs).
  - **Firebase Functions**: Serverless functions for backend logic.
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

### Code Organization
```
src/
├── ai/         # AI flows, prompts, tools, schemas
├── app/        # Next.js App Router pages and API routes
├── components/ # Reusable UI components
├── hooks/      # Custom React hooks (data fetching, UI logic)
├── lib/        # Core business logic, models, utilities
├── services/   # API service layers
└── types/      # Legacy TypeScript type definitions
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
- **Real-time Updates**: Firebase real-time subscriptions for notifications.
- **Optimistic Updates**: For a smoother user experience on data mutations.

## Development Environment

### Build Tools
- **Turbopack**: Fast bundler for Next.js development.
- **ESLint & Prettier**: Code linting and formatting.
- **Jest & React Testing Library**: Unit and component testing.

### Local Development
- **Firebase Emulators**: Full local Firebase suite for offline development.
- **Docker Compose**: For running local instances of Qdrant.
- **Ollama**: For running local LLMs and embedding models.

## Security Architecture

### Authentication & Authorization
- **Firebase Auth**: Secure authentication with session cookies.
- **Middleware**: Route protection for authenticated and admin-only routes.
- **Role-Based Access Control (RBAC)**: 'admin' vs 'user' roles enforced on the server.

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
- **Vercel / Firebase Hosting**: For deploying the Next.js frontend.
- **Firebase**: For backend services (Auth, Firestore, Functions).
- **Self-hosted / Cloud VM**: For running Qdrant and Ollama services.

### Environment Management
- **Environment Variables**: Centralized and validated configuration (`src/lib/config.ts`).
- `.env.example`: Template for easy setup.
