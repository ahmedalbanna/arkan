This document describes the API endpoint for the Code Generator feature.

**Endpoint**: `POST /api/generate-code`

**1. Purpose**

-   This endpoint takes a natural language prompt from a user and uses an AI agent to generate a complete, self-contained UI component with HTML, CSS, and (optional) JavaScript.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: A successful generation deducts one credit from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `generateCode` Genkit flow defined in `src/ai/flows/generate-code.ts`.
-   **Structured Output**: The AI is prompted to return a clean JSON object containing `html`, `css`, and `javascript` keys, which the frontend can then use to render a live preview.

**3. Workflow**

1.  A user enters a description of a UI component in the `CodeGenerator` component and clicks "Generate Code".
2.  The frontend sends the prompt to this endpoint.
3.  The route handler validates the user's session and the prompt.
4.  It calls the `generateCode` AI flow.
5.  If the flow is successful, it deducts a credit and logs the generation event.
6.  It returns the structured code object (`{ html, css, javascript }`) to the client.
7.  The frontend uses this data to update the Zustand store and render the live preview in an iframe.