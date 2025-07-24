This document describes the API endpoint for evaluating a generated report against user-defined criteria.

**Endpoint**: `POST /api/evaluate-report`

**1. Purpose**

-   This endpoint provides an AI-driven quality assurance check. It takes a complete generated report and a list of acceptance criteria and uses an AI agent to score the report and provide feedback.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: This is a premium feature. A successful evaluation deducts one credit from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `evaluateReport` Genkit flow defined in `src/ai/flows/evaluate-report.ts`.

**3. Workflow**

1.  A user provides acceptance criteria in the `EvaluationTools` component and clicks "Evaluate Report".
2.  The frontend sends the full project proposal, all generated report sections, and the criteria list to this endpoint.
3.  The route handler authenticates the user and validates the incoming data against a Zod schema.
4.  It calls the `evaluateReport` AI flow, which prompts the model to analyze the content against the criteria.
5.  If the AI flow is successful, it deducts a credit from the user's account and logs the generation event.
6.  It returns the structured evaluation output (score, feedback, summary) to the client to be displayed in the UI.