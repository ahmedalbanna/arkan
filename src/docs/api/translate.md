This document describes the API endpoints for handling text and object translation.

### POST `/api/translate`

-   **Purpose**: Translates a single piece of text to a specified target language.
-   **AI Flow**: Wraps the `translateText` Genkit flow.
-   **Key Feature**: It is carefully prompted to preserve all markdown formatting during translation, ensuring that headings, lists, bold text, etc., remain intact.
-   **Usage**: Called by the `useTranslate` hook, which is used for inline translations in components like `Section` and `EditableField`.

### POST `/api/translate-proposal`

-   **Purpose**: Translates all user-facing text values within an entire `ProjectProposal` JSON object.
-   **AI Flow**: Wraps the `translateProposal` Genkit flow.
-   **Key Feature**: It is prompted to *only* translate string values and to leave JSON keys, numbers, dates, and booleans untouched, preserving the object's structure perfectly.
-   **Usage**: Called when a user clicks the "Translate Proposal" button.

### POST `/api/translate-presentation`

-   **Purpose**: Translates all user-facing text values (titles, content, speaker notes) within a `PresentationHistoryEntry` JSON object.
-   **AI Flow**: Wraps the `translatePresentation` Genkit flow.
-   **Key Feature**: Like the proposal translator, it is prompted to preserve the JSON structure and only translate the relevant text fields.
-   **Usage**: Called when a user clicks the "Translate" button in the `PresentationViewer`.

**Common Concepts for all Translation Endpoints:**

-   **Authentication**: All translation requests must be authenticated.
-   **Credit Deduction**: Each translation call deducts credits from the user's account (1 for simple text, 2 for full objects).
-   **Error Handling**: The endpoints are designed to handle errors from the AI service and will return meaningful error messages to the client.
