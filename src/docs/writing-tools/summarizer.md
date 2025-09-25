This document outlines the AI Summarizer tool.

## Purpose

The AI Summarizer tool condenses long pieces of text into shorter, more digestible summaries.

## Key Concepts

-   **AI Flow**: Wraps the `summarizeText` Genkit flow from `src/ai/flows/summarize-text.ts`.
-   **Variable Length**: The user can choose a desired summary length ('short', 'medium', or 'long'), and the tool passes a corresponding instruction to the AI (e.g., "a single, concise paragraph" for 'short').

## Workflow

1.  A user navigates to the "AI Summarizer" page.
2.  They input their text via pasting or uploading a file.
3.  They select their desired summary `length` from a dropdown menu.
4.  The client calls the `/api/ai/writing-tools/summarize` endpoint.
5.  The API route invokes the `summarizeText` flow.
6.  The generated summary is returned and displayed to the user.
