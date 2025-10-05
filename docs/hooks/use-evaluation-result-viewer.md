# `useEvaluationResultViewer` Hook

This hook encapsulates the logic for displaying and interacting with the results of a report evaluation. It centralizes state management, API mutation handling, and helper functions, allowing the `EvaluationResultViewer` component to remain a clean, presentational component.

## Responsibilities

-   **Data Fetching**: It accesses various Zustand stores (`useReportStore`, `useBuilderStore`, `useProjectPlanStore`) to get the necessary context (like the current proposal, plan, and generated sections) required for fixing issues.
-   **Mutations**: It utilizes the `useGenerateReportSection` mutation hook to trigger the "Fix with AI" functionality.
-   **State Actions**: It provides the `setEvaluation` function from `useReportStore` to allow the component to clear the evaluation view.
-   **Helper Functions**: It contains pure helper functions for determining the UI's appearance based on data:
    -   `getScoreColor`: Returns a Tailwind CSS color class based on the evaluation score.
    -   `getScoreIcon`: Returns a Lucide icon component based on the score.
    -   `getFeedbackStatusInfo`: Returns an icon and color based on the status of a feedback item.
-   **Action Handlers**: It defines the `handleFixWithAi` function, which assembles the payload and calls the generation mutation to automatically correct a section based on feedback.

## Returned Values

The hook returns a comprehensive object containing all the necessary state and handler functions for the `EvaluationResultViewer` UI to consume, including:

-   The `t` function for localization.
-   The `setEvaluation` action.
-   The `generationMutation` object from TanStack Query.
-   The `handleFixWithAi` action handler.
-   The UI helper functions (`getScoreColor`, `getScoreIcon`, `getFeedbackStatusInfo`).
