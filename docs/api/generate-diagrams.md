This document describes the API endpoint for generating and updating PlantUML diagrams.

**Endpoint**: `POST /api/generate-diagrams`

**1. Purpose**

-   This endpoint serves a dual purpose based on the request body's `intent`:
    1.  **Generate a new diagram**: When called with a full project context, it uses an AI agent to generate PlantUML code for a specified diagram type.
    2.  **Update an existing diagram**: When called with just PlantUML code, it re-renders the diagram image without using an AI agent.

**2. Key Concepts**

-   **Authentication**: All requests must be authenticated with a user's JWT.
-   **Credit Deduction**: Generating a *new* diagram costs one credit. Simply updating the image from existing code does not cost any credits.
-   **AI Flow Integration**: For new diagram generation, the endpoint calls the `generateDiagram` Genkit flow defined in `src/ai/flows/generate-diagrams.ts`.
-   **PlantUML Rendering**: The endpoint contains helper functions to take PlantUML code, compress it, encode it, and construct a URL to the `plantuml.com` rendering service. It then proxies this image to avoid CORS issues.

**3. Workflow (New Diagram)**

1.  A user selects a diagram type to generate in the `DiagramGenerationTools` component.
2.  The frontend sends the project proposal, selected context, and diagram type to this endpoint.
3.  The route handler authenticates the user and validates the payload.
4.  It calls the `generateDiagram` AI flow.
5.  It deducts a credit and logs the generation.
6.  It takes the returned PlantUML code, generates an image URL, and returns both to the client.

**4. Workflow (Update Diagram)**

1.  A user edits the PlantUML code in the `DiagramViewer` and clicks "Update Diagram".
2.  The frontend sends a request with `intent: 'update_diagram'` and the new `plantUmlCode`.
3.  The route handler skips the AI flow and directly generates a new image URL from the provided code.
4.  It returns the new image URL to the client, which updates the view.