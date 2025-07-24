This document describes the API endpoint for converting PDF documents to structured markdown.

**Endpoint**: `POST /api/pdf-to-markdown`

**1. Purpose**

-   This endpoint is a utility used by various features (e.g., Report Generator, Exam Solver, Homework Solver) to extract and format content from an uploaded PDF file.
-   It uses a multi-modal AI agent that can process both the text and the layout of a PDF to produce clean, well-structured markdown.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **Credit Deduction**: This is a resource-intensive operation and deducts **2 credits** from the user's account upon successful conversion.
-   **AI Flow Integration**: The endpoint is a thin wrapper around the `rewriteDocumentToMarkdown` Genkit flow defined in `src/ai/flows/rewrite-document-to-markdown.ts`.
-   **File Handling**: The endpoint is designed to receive a `multipart/form-data` request containing the uploaded file. It converts the file into a Base64-encoded Data URI before passing it to the AI flow.

**3. Workflow**

1.  A user selects a PDF file in a component like `PdfToMarkdownConverter` or `GenerationTools`.
2.  The client sends a `FormData` object containing the file to this endpoint.
3.  The route handler validates the user's session and ensures a file was uploaded.
4.  It converts the file to a Data URI.
5.  It calls the `rewriteDocumentToMarkdown` AI flow.
6.  If successful, it deducts credits and returns the generated markdown text to the client.