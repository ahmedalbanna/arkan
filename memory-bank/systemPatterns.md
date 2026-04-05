# System Patterns - Arkan

## Architectural Patterns

### 1. Strict Clean Architecture (DDD)
**Purpose**: Absolute separation of concerns between business logic, orchestration, and infrastructure.
- **Implementation**: 4-layer structure in `src/modules/` (`domain`, `application`, `adapters`, `infrastructure`).

### 2. Modular AI & Schema Pattern
**Purpose**: Standardized approach for AI operations with unified data contracts.
- **Standard**: All AI flows return structured `Result<T, E>` objects.
- **Spectral Sanitization**: Mandatory use of `cleanAiOutput` to strip model conversational artifacts.

### 3. Client-Server DI Bridging Pattern
**Purpose**: Enabling high-weight services (e.g., Document Export) to be invoked from the client while executing on the server.
- **Implementation**: lightweight `ExportApiClient` proxies registered for browser environments that delegate to server API routes.

### 4. Browser-Only Dynamic Synthesis Pattern
**Purpose**: Handling libraries with mandatory DOM dependencies (e.g., `pptxgenjs`) within a Next.js 15 environment.
- **Implementation**: Moving synthesis logic entirely to client hooks using dynamic `import()` to prevent server-side reference errors.

## State & Data Patterns

### 1. Auth Status Vector Pattern
**Purpose**: ensuring predictable UI transitions and hydration safety.
- **Implementation**: A unified `AuthStatus` union (`loading`, `authenticated`, `unauthenticated`, `guest`, `error`) in `AuthContext`.

### 2. Atomic Mapping & Transformation
**Purpose**: Preventing domain contamination and race conditions.
- **Pattern**: Selective property mapping in form submissions and `targets.reduce(...)` within single store callbacks for multi-node updates.

### 3. Neural Telemetry & Monitoring
**Purpose**: Real-time observability of AI pipeline performance.
- **Implementation**: High-precision timing instrumented across Embedding, Search, and Reranking phases.

## Robustness & Resilience Patterns

### 1. Unified Existence Guard Pattern
**Purpose**: Preventing runtime crashes on partially hydrated or null state.
- **Implementation**: Explicit `if (!entity)` patterns in all interaction and persistence handlers.

### 2. Neural Error Boundary Pattern
**Purpose**: Containing failures within specific UI zones.
- **Implementation**: `RendererErrorBoundary` wrapped around the document canvas and analysis hubs.

### 3. Selection Recovery Pattern
**Purpose**: Synchronizing structural shifts with UI interaction states.
- **Implementation**: Automated sweeps that clear active focuses when nodes are deleted.

## UI/UX & Aesthetics

### 1. Intelligence Suite Aesthetic
**Purpose**: Professional technical "IDE-style" interaction model.
- **Standard**: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), and glassmorphism.

### 2. Stable Manifest Footer
**Purpose**: Providing version context and operational status.
- **Pattern**: Standardized footers (`v2.4.0-STABLE`) across all HUD and monitoring panels.
