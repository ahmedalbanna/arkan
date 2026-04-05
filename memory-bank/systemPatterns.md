# System Patterns - Arkan

## Architectural Patterns

### 1. Strict Clean Architecture (DDD)
**Purpose**: Absolute separation of concerns between business logic, orchestration, and infrastructure.
- **Domain Layer**: Pure entities, repository interfaces, and service interfaces. Zero external dependencies (except for basic utils).
- **Application Layer**: Use Cases that orchestrate domain logic. Implementation-agnostic.
- **Adapter Layer**: Controllers (API routes), Hooks (logic-heavy), State (Zustand), and Smart Components.
- **Infrastructure Layer**: Concrete implementations (SQLite, Qdrant, SMTP, JWT).

### 2. Modular AI & Schema Pattern
**Purpose**: Standardized approach for AI operations with unified data contracts.
- **Implementation**: Categorized flows in `src/modules/ai/infrastructure/flows/`.
- **Unified Schemas**: Single source of truth for tool/flow Zod schemas in `infrastructure/tools/schemas.ts`.
- **Literal Enforcement**: Using `as const` for union-based output types.

### 3. Dependency Injection (tsyringe)
**Purpose**: Decoupling components and services for testability and inversion of control.
- **Implementation**: Token-based injection in `src/infrastructure/di/container.ts`.
- **React Integration**: Standardized `useService(token)` hook for client-side resolution.

### 4. Functional Injection Pattern
**Purpose**: Maintaining domain purity for complex transformations.
- **Implementation**: Domain methods (e.g., `Project.applyTemplate`) accept infrastructure functions as callbacks rather than importing them directly.

### 5. Standardized Domain Property Pattern
**Purpose**: Enforcing type safety and predictable state management for domain entities.
- **Implementation**: All domain entities follow a strict contract:
    - `toProperties()`: Primary serialization method returning plain data objects.
    - `toStateObject()`: Backward-compatible alias for serialization.
    - `withProps()`: Standardized cloning method using deep copies for complex fields.
- **Benefits**: Eliminates naming conflicts, ensures deep immutability, and simplifies hydration.

### 6. Tiered Model Fallback Pattern
**Purpose**: Ensuring system availability in hardware-constrained (8GB RAM) environments.
- **Implementation**: `GenkitAiService.runFlow` attempts a tiered fallback (e.g., Llama 3 → Phi-3 → Gemma 2B) upon failure.
- **Benefits**: Prevents local server crashes and provides a graceful degradation of service quality.

## RAG & Vector Search Pattern

### **Purpose**
To provide relevant, up-to-date, and domain-specific context to AI models, reducing hallucinations and improving response accuracy.

### **Architecture**
1.  **Indexing Pipeline**:
    - **Input**: Documents (PDF, DOCX, TXT, MD).
    - **Process**:
        1.  `File Extraction`: Text is extracted from documents.
        2.  `Chunking`: Text is split into smaller, overlapping chunks.
        3.  `Embedding`: Each chunk is converted into a vector using Ollama (`nomic-embed-text`).
        4.  `Storage`: Vectors and metadata are stored in Qdrant.
    - **Implementation**: `src/modules/rag/infrastructure/indexer.ts`

2.  **Retrieval Pipeline**:
    - **Input**: User query (string).
    - **Process**:
        1.  `Query Embedding`: The query is converted into a vector.
        2.  `Vector Search`: Qdrant performs a similarity search (Cosine) to find the most relevant chunks.
        3.  `Filtering`: Results are filtered by `projectId`, `userId`, etc.
        4.  `Re-ranking`: Results are re-ordered using a hybrid approach (semantic + keyword) for better relevance.
        5.  `Context Formatting`: Top results are formatted into a context string for the LLM.
        6.  `Token Truncation`: Context is proactively truncated using `TokenManager` to fit within the specific model's context window.
    - **Implementation**: `src/modules/rag/infrastructure/retrieval.ts`, `src/modules/rag/infrastructure/reranker.ts`, and `src/modules/ai/domain/utils/TokenManager.ts`

### **Components**
- **Vector Store**: `src/modules/rag/infrastructure/vector-store.ts` (Factory pattern to switch between in-memory and Qdrant).
- **Qdrant Adapter**: `src/modules/rag/infrastructure/qdrant-adapter.ts` (Production-ready implementation).
- **Embedding Service**: `src/modules/rag/infrastructure/embeddings.ts` (Handles communication with Ollama).
- **Caching**: `src/modules/rag/infrastructure/cache.ts` (In-memory LRU cache for embeddings and search results).

### **Benefits**
- **Reduces Hallucinations**: Grounds AI responses in factual data.
- **Enables Domain-Specific Knowledge**: Allows the AI to use proprietary or project-specific information.
- **Keeps Knowledge Current**: The knowledge base can be updated without re-training the model.

## Conversational AI Pattern (Project Consultant)

### **Purpose**
To provide users with a real-time, context-aware AI assistant that can answer questions, provide feedback, and offer suggestions about their currently active project.

### **Architecture**
1.  **Frontend Component (`ProjectChat.tsx`)**:
    - A floating chat window that can be toggled by the user.
    - Manages the display of the conversation history.
    - Captures user input and triggers the AI interaction.

2.  **Client-side Hook (`useProjectChat.ts`)**:
    - Manages the state of the chat session (messages, loading status).
    - Retrieves the full context of the current project from the `useBuilderStore`.
    - Uses React Query's `useMutation` to call the backend API endpoint.
    - Appends user messages and AI responses to the conversation history for a seamless chat experience.

3.  **API Route (`/api/chat/project-consultant`)**:
    - A secure endpoint protected by the `withAuth` middleware.
    - Receives the user's message, the full project context, and the conversation history.
    - Calls the corresponding Genkit AI flow (`projectConsultantFlow`).

4.  **AI Flow (`projectConsultantFlow`)**:
    - A Genkit flow specifically designed for conversational consultation.
    - It receives the project context and conversation history and injects them into a system prompt.
    - The system prompt instructs the AI to act as an expert consultant, using the provided project data to give relevant advice.
    - It processes the user's immediate message to generate a helpful, context-aware response.

### **Benefits**
- **Context-Aware Assistance**: The AI has full knowledge of the user's current project, allowing it to provide highly relevant and specific advice.
- **Interactive Experience**: Transforms the static document-building process into a dynamic conversation.
- **Improved Productivity**: Users can get instant feedback and ideas without leaving their workspace.

## State Management Patterns

### 1. Zustand Store Pattern (Client-side)
**Purpose**: Lightweight global state management for UI and session data.
- **Implementation**: `src/modules/[domain]/adapters/state/`
- **Usage**: Manages the active project, application status (`loading`, `dirty`, `saving`), and user settings. Stores are co-located with their domain.

### 2. Atomic State Transformation Pattern
**Purpose**: Preventing race conditions and ensuring state consistency during complex multi-node updates.
- **Implementation**: Using `targets.reduce((p, id) => p.updateSection(id, ...), project)` within a single `updateProject` callback.
- **Benefits**: Ensures that bulk operations (like updating 10 sections at once) result in a single, atomic mutation of the project manifest.

### 3. React Query Pattern (Server-side Cache)
**Purpose**: Server state management with caching, refetching, and synchronization.
- **Implementation**: Domain-specific hooks in `src/modules/[domain]/adapters/hooks/`.
- **Benefits**: Reduces redundant API calls, provides optimistic updates, handles background refetching. Uses centralized key factory in `src/infrastructure/api/query-keys.ts`.

## Robustness & Resilience Patterns

### 1. Unified Existence Guard Pattern
**Purpose**: Standardizing defensive checks to prevent runtime crashes on partially hydrated or null state.
- **Implementation**: Explicit `if (!project || !updateProject) return` patterns in all lifecycle and interaction handlers.

### 2. Neural Error Boundary Pattern
**Purpose**: Containing failures within specific UI zones (like the document renderer or AI analyst) to prevent full-page crashes.
- **Implementation**: Localized `RendererErrorBoundary` components wrapped around high-risk rendering pipelines.

### 3. Selection Recovery Pattern
**Purpose**: Synchronizing structural shifts with UI interaction states to prevent "orphaned" focuses.
- **Implementation**: Structural deletion methods trigger callbacks (`onSelectChapter(null)`) to clear workspace focus if the active node is removed.

## UI/UX & Architecture Patterns

### 1. 3-Zone Workspace Architecture (IDE Pattern)
**Purpose**: Maximizing focus and logical flow for complex document production.
- **Top Zone**: Horizontal bar for project identity and Session Actions (Export, Save).
- **Left Zone**: Primary navigation and Setup Tools (Files, Templates, Chapters).
- **Center Zone**: Primary work area (A4 preview, Editor) with a dedicated status HUD.
- **Right Zone**: Context-sensitive AI controls, behavioral rules, and chat.

### 2. Production Manifest Pattern
**Purpose**: Standardized, high-trust model for complex multi-step operations.
- **Implementation**: Used in Build Project, Export, Browse Library dialogs, and standalone Writing Tools.
- **Features**: Technical header with activity pulse, data-dense body, and versioned footer.

### 3. Manifest Workspace Architecture
**Purpose**: Specialized layout for standalone intelligent tools (Summarizer, Researcher, Stylist).
- **Setup Zone (Left)**: Technical side-panel (400-450px) for configuration protocols and logic definitions.
- **Results Canvas (Right)**: Immersive, high-fidelity work area with radial grid textures and shadow-inner effects.
- **Interactive HUDs**: Floating controls for view switching (e.g., Comparison vs. Logic Diff).

### 4. Sidebar Dashboard Density
**Purpose**: Maintaining professional aesthetics and readability in narrow sidebars (20-25%).
- **Styling**: `text-[10px]` bold uppercase tracking for labels, `bg-muted/5` for input backgrounds.
- **Hierarchy**: Priority-based tab reordering (e.g., Context -> Prompt -> Controls).

### 5. Contextual HUD Pattern
**Purpose**: Keeping secondary document utilities accessible without cluttering toolbars.
- **Implementation**: Floating, semi-transparent glass-morphism containers (e.g., Zoom HUD, Syntax Guides).

### 5. State Lifting for Zone Sync
**Purpose**: Seamless coordination between interactive UI zones.
- **Pattern**: Lifting active selection state (Chapter/Section) to the main page hook to automatically focus relevant sidebar panels.

## Error Handling Patterns

### 1. Centralized API Error Handling
**Purpose**: Consistent error handling for all API routes.
- **Implementation**: `src/infrastructure/api/api-utils.ts` (`handleApiError`)
- **Benefits**: Standardized error responses, utilizes the **Result Pattern** for explicit error flow throughout the stack.

### 2. Document Processing Error Handling
**Purpose**: Robust error handling for document generation (DOCX, PPTX).
- **Implementation**: `src/lib/word-converter/ast-converter.ts`, `src/lib/utils/ProxiedImage.ts`
- **Features**: Graceful fallbacks for invalid images and malformed tables, preventing export crashes.

## Security Patterns

### 1. Authentication Guard HOF
**Purpose**: Protecting API routes and server actions from unauthorized access.
- **Implementation**: `src/lib/utils/api-utils.ts` (`withAuth`)
- **Benefits**: Centralized auth logic, support for admin-only routes.

### 2. Image Proxy
**Purpose**: Avoids CORS issues and provides a security layer for fetching external images.
- **Implementation**: `src/app/api/proxy/convert/route.ts`
- **Features**: Whitelists allowed domains to prevent abuse (SSRF).

### 3. Local File Storage
**Purpose**: Self-contained file management without cloud dependencies.
- **Service**: `LocalFileStorageService` (implements `IFileStorageService`).
- **Storage**: Files are persisted in the root `storage/uploads/` directory.
- **Serving**: Files are served through a secure API route `src/app/api/storage/[...path]/route.ts` with path traversal protection.

## Developer Experience Patterns

### 1. Interactive API Documentation
**Purpose**: Provide developers with a clear, interactive way to understand and test the application's API.
- **Implementation**:
  - **Configuration**: `src/config/api-docs.ts` - A single source of truth defining all API endpoints, their methods, descriptions, authentication levels, and example request/response bodies.
  - **UI Components**: Reusable components in `src/components/api-docs/` such as `EndpointCard`, `ApiTester`, and `CodeBlock` create a dynamic and maintainable documentation page.
  - **Page**: `/app/api-docs/page.tsx` - The main page that renders the documentation from the configuration file.
- **Benefits**:
  - **Self-Documenting**: The API documentation is tightly coupled with its definition, reducing the chance of it becoming outdated.
  - **Interactive Testing**: Developers can make live API calls directly from the documentation UI, speeding up testing and integration.
  - **Clarity**: Provides a clear contract for each endpoint, including required parameters and expected response structures.
  - **Maintainability**: Adding or updating API documentation is as simple as updating the central configuration file.
