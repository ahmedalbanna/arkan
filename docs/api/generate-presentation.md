This document describes the API endpoint for the Presentation Generator feature.

**Endpoint**: `POST /api/generate-presentation`

**1. Purpose**

-   This endpoint takes a project proposal and other generated content (report sections, diagrams) and uses an AI agent to create a complete slide deck.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: A successful generation deducts one credit from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `generatePresentation` Genkit flow defined in `src/ai/flows/generate-presentation.ts`.
-   **Structured Output**: The AI is prompted to return a well-structured JSON object containing an array of `slides`. Each slide object has a `title`, an array of `content` bullet points, and `speakerNotes`.
-   **Template-Driven**: The request includes a `templateId` which the AI can use to understand the desired structure and focus of the presentation (e.g., technical vs. business-focused).

**3. Workflow**

1.  A user selects context and a template in the `PresentationGenerationTools` component and clicks "Generate Presentation".
2.  The frontend sends the project proposal, selected context, and template ID to this endpoint.
3.  The route handler validates the user's session and the request payload.
4.  It calls the `generatePresentation` AI flow.
5.  If the flow is successful, it deducts a credit and logs the generation event.
6.  It returns the structured slide deck object to the client, which is then added to the `usePresentationStore` and displayed in the viewer.
