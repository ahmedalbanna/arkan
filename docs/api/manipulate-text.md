This document describes the API endpoint for performing various text manipulations.

**Endpoint**: `POST /api/manipulate-text`

**1. Purpose**

-   This is a versatile, general-purpose endpoint that uses an AI agent to modify a piece of text based on a specific command. It powers the "AI Actions" (Summarize, Expand, Rewrite, etc.) available in the `Section` and `EditableField` components.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: A successful manipulation deducts one credit from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `manipulateText` Genkit flow defined in `src/ai/flows/manipulate-text.ts`.

**3. Workflow**

1.  A user clicks on an AI action, such as "Summarize", on a piece of editable content.
2.  The frontend sends a request to this endpoint containing the text to be manipulated and the command (e.g., "Summarize this text concisely.").
3.  The route handler validates the user's session and the request payload.
4.  It calls the `manipulateText` AI flow.
5.  If the flow is successful, it deducts a credit.
6.  It returns the `rewrittenText` to the client, which is then displayed as an "AI Suggestion" that the user can accept or reject.
