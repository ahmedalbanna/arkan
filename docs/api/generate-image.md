This document describes the API endpoint for the AI Image Generator.

**Endpoint**: `POST /api/generate-image`

**1. Purpose**

-   This endpoint provides a direct interface to an AI image generation model. It takes a text prompt and returns a generated image.
-   Its primary use in this application is for administrators to generate and refresh preview images for the DOCX and PPTX templates.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated. In its current use, this means an admin must be logged in.
-   **Credit Deduction**: Generating an image is a resource-intensive task and deducts **5 credits** from the user's account.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `generateImage` Genkit flow defined in `src/ai/flows/generate-image.ts`.
-   **Data URI Output**: The AI flow is configured to return the generated image as a Base64-encoded Data URI (`data:image/png;base64,...`).

**3. Workflow (for Template Previews)**

1.  An admin clicks the "Refresh" button on a template card in the `DocxTemplateManager` or `PptxTemplateManager`.
2.  The client sends a request to `/api/templates/refresh-image` with the template ID and a hint prompt.
3.  The `refresh-image` route handler calls this `/api/generate-image` endpoint internally (or rather, it calls the same underlying `generateImage` flow).
4.  The generated image (as a Data URI) is then uploaded to Firebase Storage.
5.  The public URL of the stored image is saved back to the template's document in Firestore.
6.  The frontend invalidates the template query to show the new preview image.