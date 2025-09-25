This document outlines the AI Document Writer tool.

## Purpose

The Document Writer is a powerful tool designed to generate complete, long-form documents (like essays, reports, or articles) from a single topic and optional instructions.

## Key Concepts

-   **AI Flow**: Wraps the `writeDocument` Genkit flow from `src/ai/flows/write-document.ts`.
-   **Context-Aware Generation**: The user can provide additional context or specific knowledge to guide the AI, ensuring the content is relevant and accurate.
-   **Structured Generation**: The user can provide a Table of Contents. The AI is then prompted to follow this structure, ensuring the document is well-organized and covers all required topics.
-   **Credit Cost**: This is a highly intensive task and costs **3 credits** per use.

## Workflow

1.  A user navigates to the "AI Document Writer" page.
2.  They provide a `topic` and select a `documentType` (e.g., "Blog Post", "Essay").
3.  Optionally, they can add specific `knowledge` or a `tableOfContents` to guide the AI.
4.  The client calls the `/api/ai/writing-tools/write-document` endpoint.
5.  The API route invokes the `writeDocument` flow.
6.  The complete document, formatted in Markdown, is returned to be displayed and downloaded.
