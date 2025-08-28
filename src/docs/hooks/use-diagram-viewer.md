# `useDiagramViewer` Hook

This hook encapsulates the logic for the `DiagramViewer` component, which is responsible for displaying a diagram's image, its PlantUML code, and its AI-generated explanation. It manages the view state and handles user actions like copying, downloading, and requesting an explanation.

## Responsibilities

-   **State Management**: Manages the local UI state, including `isCopied`, `isDownloading`, and the current `viewMode` ('image', 'code', or 'explanation').
-   **Data Fetching & Stores**: Accesses `useSectionStore` and `useLocalization` to get the diagram's configuration and display title.
-   **Action Handling & Mutations**:
    -   `handleCopy`: Copies the diagram's PlantUML code to the clipboard.
    -   `handleDownload`: Fetches the diagram image and saves it to the user's device using `file-saver`.
    -   `handleExplainClick`: Switches the view to 'explanation' and triggers the `useExplainDiagram` mutation if an explanation doesn't already exist. It handles the full asynchronous flow of fetching the image, converting it to Base64, and calling the mutation.
-   **Localization & Feedback**: Provides the `t` function for UI text and uses `useToast` to give feedback to the user for various actions.

## Returned Values

The hook returns an object with all the state and handlers needed by the `DiagramViewer` component:

-   `t`: The localization function.
-   `diagramTitle`: The translated title of the diagram.
-   `isCopied`: A boolean state for the copy button's feedback.
-   `isDownloading`: A boolean state for the download button's loading state.
-   `viewMode`, `setViewMode`: The current view mode and its setter function.
-   `explainMutation`: The mutation object from `useExplainDiagram`.
-   `handleCopy`: The handler function for the copy action.
-   `handleDownload`: The handler function for the download action.
-   `handleExplainClick`: The handler function for the explain action.
