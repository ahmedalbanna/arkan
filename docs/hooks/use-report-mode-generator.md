# `useReportModeGenerator` Hook

This hook encapsulates the core logic for the `ReportModeGenerator` component, which serves as the main layout for the report generation feature. It manages the UI state for the collapsible panel and orchestrates complex actions like translating all report sections.

## Responsibilities

-   **UI State Management**: Manages the `isPanelCollapsed` state to control the visibility of the `GenerationTools` panel.
-   **Action Handling**:
    -   Provides `handleSectionUpdate` to update the content of a single report section in the `useReportStore`.
    -   Provides `handleTranslateAll` to orchestrate the translation of all generated report sections. This involves:
        -   Managing the `isTranslatingAll` loading state.
        -   Displaying toast notifications to the user for starting and completing the process.
        -   Calling the `useTranslate` mutation for each section.
        -   Aggregating the results and updating the `useReportStore` with the translated content.
-   **Localization**: Fetches the `t` function and current `locale` from `useLocalization` to pass down to UI components.

## Returned Values

The hook returns a comprehensive object containing all the necessary state and handler functions for the `ReportModeGenerator` UI to consume:

-   `t`: The localization function.
-   `locale`: The current language locale ('en' or 'ar').
-   `isPanelCollapsed`, `setIsPanelCollapsed`: State and setter for the tools panel visibility.
-   `handleSectionUpdate`: Function to update a section's content.
-   `handleTranslateAll`: Function to translate all sections.
-   `isTranslatingAll`: A boolean flag indicating if the bulk translation is in progress.
