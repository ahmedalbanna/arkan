This document outlines the AI Humanizer tool.

## Purpose

The AI Humanizer is designed to take text that sounds robotic or overly formal (often a characteristic of AI-generated content) and rewrite it to sound more natural and human-like.

## Key Concepts

-   **AI Flow**: Wraps the `humanizeText` Genkit flow from `src/ai/flows/humanize-text.ts`.
-   **Stylistic Rewrite**: The AI focuses on improving the text's flow and readability by varying sentence structure, using common contractions, and injecting a more natural rhythm, all while preserving the core meaning.
-   **Markdown Preservation**: The AI is prompted to keep all original Markdown formatting intact.

## Workflow

1.  A user navigates to the "AI Humanizer" page.
2.  They paste the text they want to improve.
3.  The client calls the `/api/ai/writing-tools/humanize` endpoint.
4.  The API route invokes the `humanizeText` flow.
5.  The rewritten, more natural-sounding text is returned to the client.
