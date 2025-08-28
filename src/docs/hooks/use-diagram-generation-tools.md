# `useDiagramGenerationTools` Hook

This hook encapsulates the complex logic for the `DiagramGenerationTools` component. It manages state, handles chained asynchronous operations (diagram generation followed by explanation), and gathers all necessary data from various stores, adhering to the "fat hook, thin component" pattern.

## Responsibilities

-   **State Management**:
    -   Manages `activeMutationKey` to track which specific diagram is currently being generated.
-   **Data Fetching & Stores**:
    -   It accesses multiple Zustand stores (`useAgents`, `useSectionStore`, `useDiagramStore`, `useBuilderStore`, `useReportStore`, `useProjectPlanStore`) to get the complete application state required for diagram generation.
    -   It uses `useAuth` to get user profile information for credit checks and authentication.
-   **Action Handling & Mutations**:
    -   It uses `useGenerateDiagram` and `useExplainDiagram` mutations from TanStack Query.
    -   It orchestrates a complex `onSuccess` callback for `useGenerateDiagram`:
        1.  Updates the `useDiagramStore` with the new diagram code and image URL.
        2.  Fetches the newly generated diagram image.
        3.  Converts the image to a Base64 data URI.
        4.  Automatically triggers the `explainMutation` to get a textual explanation for the new diagram.
        5.  Updates the store with the explanation upon success.
    -   `onGenerateDiagram`: An async function that gathers all required context (proposal, plan, other sections, guidelines, etc.), constructs the API request body, and triggers the `diagramMutation`.
-   **Derived State**:
    -   Calculates boolean flags like `isAnythingGenerating`, `isDisabled`, and `hasCreditsForGeneration`.
    -   Provides a `checkHasSelectedContext` function that the component can call to determine if the generate button for a specific diagram should be enabled.
-   **Localization & Feedback**: Provides the `t` function for UI text and uses `useToast` to give user feedback throughout the generation and explanation process.

## Returned Values

The hook returns an object with all the state and handlers needed by the `DiagramGenerationTools` component:

-   `t`: The localization function.
-   `agents`, `agentsLoaded`: The list of available agents and their loading status.
-   `userProfile`: The current user's profile.
-   `activeMutationKey`: The key of the diagram currently being generated.
-   `isAnythingGenerating`, `isDisabled`, `hasCreditsForGeneration`: Boolean flags for managing UI state.
-   `onGenerateDiagram`: The handler function to trigger diagram generation.
-   `diagramSections`, `getIconComponent`: Data and helpers from `useSectionStore`.
-   `checkHasSelectedContext`: A function to check if a specific diagram has the necessary context to be generated.
