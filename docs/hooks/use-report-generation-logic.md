# `useReportGenerationLogic` Hook

This hook encapsulates the complex business logic, state management, and side effects related to generating report sections within the `GenerationTools` component. By centralizing this logic, the `GenerationTools` component can remain a cleaner, more presentational component.

## Responsibilities

-   **State Management**: Manages local component state such as `activeMutationKey`, `generationPlan`, and `isPlanning`.
-   **Data Aggregation**: Fetches and combines data from various Zustand stores (`useAuth`, `useBuilderStore`, `useReportStore`, `useDiagramStore`, etc.) and React Query hooks (`useAgents`, `useReportTemplates`).
-   **Side Effects**: Handles `useEffect` hooks for initializing dependent states and setting default templates.
-   **Business Logic**: Contains the core functions for:
    -   `onGenerateSection`: Assembling the payload and triggering the mutation to generate a single report section.
    -   `getGenerationPlan`: Evaluating the current project state to create a plan for full report generation.
    -   `onGenerateFullReport`: Triggering the mutation to generate all remaining sections of a report based on the plan.
-   **Derived State**: Uses `useMemo` to efficiently calculate values like `availableSections`, `canGenerateFullReport`, and credit costs, which depend on multiple state sources.

## Returned Values

The hook returns a comprehensive object containing all the necessary state and handler functions for the `GenerationTools` UI to consume, including:

-   Loading and status flags (`isAnythingGenerating`, `isPlanning`, `agentsLoaded`, etc.).
-   State values (`activeMutationKey`, `generationPlan`, `availableSections`, etc.).
-   Action handlers (`onGenerateSection`, `onGenerateFullReport`, `handleViewPlan`).
-   Data from other hooks (`reportTemplates`, `selectedReportTemplateId`, etc.).

This abstraction follows the "fat hook, thin component" pattern, leading to better separation of concerns, improved readability, and easier testing and maintenance.
