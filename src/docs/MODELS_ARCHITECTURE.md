# Arkan Application: Data Models Guide

This document outlines the Object-Oriented, model-driven architecture used for managing data structures within the Arkan application. This approach ensures that data is consistent, encapsulated, and easy to maintain.

## 1. Core Principle: Models as the Single Source of Truth

The core principle of this architecture is that each primary data entity in the application (e.g., a Project, a User, a Team) is represented by a **class** defined in its own file within the `src/lib/models/` directory.

Each model file is the **single source of truth** for that entity. This means:
1.  **Properties Interface**: It exports a `[ModelName]Properties` interface that defines the plain JavaScript object structure for the model's data. This is what is stored in Firestore and received from the API.
2.  **Class Definition**: It exports a `[ModelName]` class that encapsulates the data and any related business logic or helper methods.
3.  **Related Types**: All other related types, enums, or interfaces are co-located in the same file.

This consolidation eliminates the redundancy that previously existed between `src/lib/types.ts` and the model files, making the code easier to navigate and maintain.

---

## 2. Key Models

### `src/lib/models/project.ts`

-   **`Project` class**: This is the most important model in the application. It acts as the central container for all data related to a user's active work session, including the proposal, all report sections, diagrams, presentations, and more.
-   **Zustand (`useBuilderStore`)**: A single instance of the `Project` class is held in this store, making the current project state globally accessible.
-   **Methods**: It includes numerous methods for safely manipulating its internal state, such as `addSection()`, `updateDiagramCode()`, `setProjectPlan()`, etc. These methods are the only correct way to modify project data.

### `src/lib/models/user.ts`

-   **`User` class**: Represents an application user. It consolidates properties from a user's Firestore profile (`UserProfile`) and their membership in a team (`TeamMember`).
-   **`getInitials()`**: An example of an instance method that provides derived data (the user's initials for an avatar).

### `src/lib/models/team.ts`

-   **`Team` class**: Represents a collaborative team.
-   **Composition**: A `Team` instance contains an array of `User` instances for its members, demonstrating how models can be composed of other models.

### `src/lib/models/agent.ts`

-   **`Agent` class**: Defines the configuration for an AI agent, including its prompt, category, and enabled status.
-   **`AgentPrompt` interface**: A complex type co-located in this file, defining the structure of an agent's prompt (which can be a simple string or a detailed object with guidelines).

### `src/lib/models/transaction.ts`

-   **`Transaction` class**: Represents a payment transaction record.
-   **Helper Methods**: Includes methods like `getFormattedDate()` and `getFormattedPrice()` to provide consistent formatting for UI display.

### `src/lib/models/section.ts`

-   **`Section` class**: Represents the configuration for a dynamic section in the Builder UI (e.g., a report section or a diagram type). It links a UI element to a specific `agentId`.

### `src/lib/models/diagram.ts`

-   **`Diagram` class**: Represents a single generated diagram, encapsulating its PlantUML code, the URL of the rendered image, and an optional explanation.

### `src/lib/models/template.ts` (and subclasses)

-   **`Template` class**: A base class for all template types.
-   **Subclasses**: `DocxTemplate`, `PptxTemplate`, `ProposalTemplate`, etc., extend the base `Template` and add properties specific to their type, such as styling objects.

---

## 3. Usage Pattern

-   **Services (`/src/services`)**: Fetch raw data (`[ModelName]Properties`) from the API.
-   **React Query Hooks (`/src/hooks`)**: Use the `select` option in `useQuery` to transform the raw data into instances of the model classes (e.g., `new User(data)`). This ensures that components always receive full-fledged objects with their associated methods.
-   **Components**: Interact with the model instances, calling their methods to perform actions or get derived data.
-   **State Stores (Zustand)**: When a model instance needs to be stored globally (like the main `Project` object), it's held in a Zustand store. Components interact with the model through the store's actions to ensure state updates are handled correctly.
