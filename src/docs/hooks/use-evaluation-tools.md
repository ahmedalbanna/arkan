# `useEvaluationTools` Hook

This hook encapsulates the logic for the `EvaluationTools` component, which allows users to evaluate a generated report against a set of criteria. It manages the component's state, handles file processing, and orchestrates the API call for the evaluation.

## Responsibilities

-   **State Management**:
    -   Manages the `criteria` text area content.
    -   Manages the selected `pdfFile` for uploading criteria.
    -   Manages the `isProcessingPdf` loading state for the PDF processing action.
-   **Data Fetching**: It accesses various Zustand stores (`useBuilderStore`, `useReportStore`, `useDiagramStore`) and the `AuthContext` to gather all necessary data for the evaluation payload.
-   **Action Handling**:
    -   `handleFileChange`: Manages the state of the file input.
    -   `handleProcessPdf`: Handles the API call to `processFileApi` to extract criteria from an uploaded PDF. It manages loading states and displays toasts on success or failure.
    -   `handleSubmit`: Constructs the final payload for the evaluation, validates the proposal data against a Zod schema, and calls the `useEvaluateReport` mutation.
-   **Localization & Feedback**: Provides the `t` function for UI text and uses `useToast` to give feedback to the user.

## Returned Values

The hook returns an object containing all the necessary state and handlers for the `EvaluationTools` component to function:

-   `t`: The localization function.
-   `criteria`, `setCriteria`: State and setter for the acceptance criteria text.
-   `pdfFile`: The currently selected PDF file.
-   `isProcessingPdf`: A boolean indicating if a PDF is currently being processed.
-   `mutation`: The mutation object from `useEvaluateReport` (TanStack Query), which includes status flags like `isPending`.
-   `handleFileChange`: Handler for the file input's `onChange` event.
-   `handleProcessPdf`: Handler for the "Process PDF" button's `onClick` event.
-   `handleSubmit`: Handler for the form's `onSubmit` event.
