# `useDiagramGenerator` Hook

This hook encapsulates the logic for the main `DiagramGenerator` component, which acts as the layout and orchestrator for the diagram generation feature. It manages UI state (like the collapsible panel) and handles the logic for updating existing diagrams.

## Responsibilities

-   **UI State Management**:
    -   Manages `isPanelCollapsed` state to control the visibility of the `DiagramGenerationTools` panel.
-   **Data Fetching & Stores**:
    -   Accesses `useSectionStore` to get configurations for all available diagrams (`diagramSections`).
    -   Accesses `useDiagramStore` to get the current state of all generated diagrams and the functions to update them (`diagrams`, `handleDiagramCodeUpdate`, etc.).
    -   Uses `useLocalization` for UI text and locale information.
-   **Action Handling & Mutations**:
    -   It uses the `useUpdateDiagram` mutation from TanStack Query.
    -   The `onSuccess` callback for the mutation finds the correct diagram in the store (based on the PlantUML code that was sent) and updates it with the new image URL and code.
    -   `handleUpdateDiagram`: A handler function that triggers the `mutation.mutate` call.
-   **Derived State**:
    -   Calculates `orderedDiagrams` based on the keys from `diagramSections`.
    -   Calculates `generatedDiagrams` by filtering `orderedDiagrams` to only include those that exist in the `diagrams` store state. This derived array is used to render the accordion of viewers.

## Returned Values

The hook returns an object with all the state and handlers needed by the `DiagramGenerator` component:

-   `t`, `locale`: Localization function and current locale.
-   `isPanelCollapsed`, `setIsPanelCollapsed`: State and setter for the tools panel visibility.
-   `diagramSections`, `getIconComponent`: Data and helpers from `useSectionStore`.
-   `diagrams`, `handleDiagramCodeUpdate`, `setDiagramExplanation`: State and actions from `useDiagramStore`.
-   `mutation`: The mutation object from `useUpdateDiagram`.
-   `handleUpdateDiagram`: The handler function to trigger a diagram update.
-   `generatedDiagrams`: The memoized array of diagrams that have been generated.
