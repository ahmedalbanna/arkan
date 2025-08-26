# `useSectionLogic` Hook

This hook encapsulates the complex business logic, state management, and side effects for an individual report section displayed in `ReportResults.tsx`. It follows the "fat hook, thin component" pattern, making the `Section` component primarily responsible for rendering UI.

## Responsibilities

-   **State Management**: Manages local state for a section, including:
    -   `localContent`: The editable content of the section.
    -   `aiSuggestion`: The content suggested by an AI writing tool.
    -   `diff`: The computed difference between the original content and the AI suggestion.
    -   Audio player state (`audioRef`, `audioSrc`, `showAudioPlayer`) for the text-to-speech feature.
-   **Data Processing**:
    -   Calculates word and character counts for the section content.
    -   Processes PlantUML code blocks within the markdown to render diagrams.
-   **User Actions & Mutations**:
    -   Handles various AI-powered actions like "summarize," "expand," and "check grammar" via `manipulateMutation`.
    -   Manages specialized writing tools like "rewrite" and "humanize" using the generic `useWritingTool` hook.
    -   Initiates text-to-speech generation via `ttsMutation`.
    -   Provides handlers for user actions like accepting (`handleAcceptSuggestion`) or rejecting (`handleRejectSuggestion`) AI suggestions.

## Returned Values

The hook returns a comprehensive object containing all the necessary state and handler functions for the `Section` component to consume, abstracting away the implementation details of the various mutations and state updates.
