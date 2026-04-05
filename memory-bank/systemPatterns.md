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
- **Implementation**: Lightweight `ExportApiClient` proxies registered for browser environments that delegate to server API routes.

### 4. Browser-Only Dynamic Synthesis Pattern
**Purpose**: Handling libraries with mandatory DOM dependencies (e.g., `pptxgenjs`) within a Next.js 15 environment.
- **Implementation**: Moving synthesis logic entirely to client hooks (e.g., `useExport`) using dynamic `import()` to prevent server-side reference errors.

## State Management Patterns

### 1. Atomic State Transformation Pattern
**Purpose**: Ensuring state consistency during multi-node updates.
- **Implementation**: Using functional reduction (e.g., `targets.reduce(...)`) within a single `updateProject` callback.

### 2. Neural Telemetry & Monitoring Pattern
**Purpose**: Real-time observability of AI pipeline performance.
- **Implementation**: High-precision timing (`performance.now()`) instrumentation across Embedding, Search, and Reranking phases, transmitted via structured `telemetry` metadata.

## Robustness & Resilience Patterns

### 1. Hybrid Reranking Guard Pattern
**Purpose**: Optimizing compute by bypassing expensive reranking steps when initial results meet high confidence thresholds (Score > 0.92).

### 2. Neural Error Boundary Pattern
**Purpose**: Containing rendering failures within specific UI zones.
- **Implementation**: `RendererErrorBoundary` wrapped around the document canvas and analysis hubs.

### 3. Selection Recovery Pattern
**Purpose**: Synchronizing structural shifts with UI interaction states.
- **Implementation**: Automated sweeps that clear or update active focuses when nodes are deleted.

## UI/UX & Aesthetics

### 1. Intelligence Suite Aesthetic
**Purpose**: Professional technical "IDE-style" interaction model.
- **Standard**: 28px dot-grids, high-density labels (`text-[10px]`, `font-black`, `uppercase`), and glassmorphism.

### 2. Stable Manifest Footer
**Purpose**: Providing version context and operational status.
- **Pattern**: Standardized footers (`v2.4.0-STABLE`) across all HUD and monitoring panels.
