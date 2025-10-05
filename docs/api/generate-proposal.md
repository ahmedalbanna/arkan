This document describes the API endpoint for the Proposal Generator feature.

**Endpoint**: `POST /api/generate-proposal`

**1. Purpose**

-   This endpoint is the core of the project initiation flow. It takes a user's raw project idea and uses an AI agent to generate a complete, structured, and professional project proposal.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: A successful generation deducts one credit from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `generateProposal` Genkit flow defined in `src/ai/flows/generate-proposal.ts`.
-   **Template-Driven**: The request includes a `templateId`, which is used to fetch a specific prompt and set of guidelines from Firestore. This allows for different types of proposals (e.g., software, marketing) to be generated.
-   **Structured Output**: The AI is heavily prompted to return a valid JSON object that conforms to the `ProjectProposalSchema`. This structured data is then used throughout the rest of the application.

**3. Workflow**

1.  A user enters a project idea in the `ProposalGenerationTools` component.
2.  The frontend sends the idea, selected `templateId`, and any custom guidelines to this endpoint.
3.  The route handler validates the user's session and the payload.
4.  It fetches the corresponding template from Firestore to construct the final prompt for the AI.
5.  It calls the `generateProposal` AI flow.
6.  If the flow is successful, it deducts a credit and logs the generation.
7.  It returns the structured `ProjectProposal` object to the client.
