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
- **Implementation**: Lightweight `ExportApiClient` proxies registered for browser environments that delegate to server API routes, while full infrastructure services remain isolated on the server.

### 4. Standardized Domain Property Pattern
**Purpose**: Enforcing type safety and predictable state management for domain entities.
- **Pattern**: Entities utilize `toProperties()`, `toStateObject()`, and `withProps()`.

## State Management Patterns

### 1. Zustand Store Pattern (Client-side)
**Purpose**: Lightweight global state management for UI and session data.
- **Usage**: Manages active projects and application status. Uses atomic selectors to minimize re-renders.

### 2. Atomic State Transformation Pattern
**Purpose**: Preventing race conditions and ensuring state consistency during multi-node updates.
- **Implementation**: Using functional reduction (e.g., `targets.reduce((p, id) => p.updateSection(id, ...), project)`) within a single `updateProject` callback.

### 3. React Query Pattern (Server-side Cache)
**Purpose**: Server state management with caching and optimistic updates.

## Robustness & Resilience Patterns

### 1. Unified Existence Guard Pattern
**Purpose**: Preventing runtime crashes on partially hydrated or null state.
- **Implementation**: Explicit `if (!project || !userProfile) return` patterns in all interaction handlers.

### 2. Neural Error Boundary Pattern
**Purpose**: Containing rendering failures within specific UI zones to prevent full-page crashes.
- **Implementation**: `RendererErrorBoundary` wrapped around the document canvas and analysis hubs.

### 3. Selection Recovery Pattern
**Purpose**: Synchronizing structural shifts with UI interaction states.
- **Implementation**: "Selection Recovery" sweeps that automatically clear or update active focuses when nodes are deleted.

### 4. Persistence Containment Pattern
**Purpose**: Ensuring unhandled errors in async pipelines don't compromise session stability.
- **Implementation**: Mandatory `try-catch` blocks around all project mutations, external service calls, and AST transformations.

## UI/UX & Architecture Patterns

### 1. 3-Zone Workspace Architecture (IDE Pattern)
**Purpose**: Maximizing focus for complex document production.

### 2. Manifest Interaction Model
**Purpose**: Professional technical manifests for multi-step operations (Build, Export, Acquisition).
- **Aesthetic**: 28px dot-grids, glassmorphism, and active status pulses.

### 3. Stable Manifest Footer
**Purpose**: Providing version context and operational status to the user.
- **Pattern**: Standardized footers (`v2.4.0-STABLE`) across all HUD panels.
