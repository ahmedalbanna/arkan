This document outlines the AI Paraphraser tool.

## Purpose

The Paraphraser tool allows users to rewrite a piece of text in various styles, such as making it more fluent, formal, creative, or simple, without losing the original meaning.

## Key Concepts

-   **AI Flow**: Wraps the `paraphraseText` Genkit flow from `src/ai/flows/paraphrase-text.ts`.
-   **Multiple Modes**: The tool provides several paraphrasing modes (`standard`, `fluent`, `formal`, `creative`, `simplify`), each with a specific instruction set for the AI.
-   **Markdown Preservation**: The AI is carefully prompted to maintain all original Markdown formatting, ensuring that headings, lists, and other structural elements are not lost during the rewrite.

## Workflow

1.  A user navigates to the "AI Paraphraser" page.
2.  They input their text via pasting or uploading a file.
3.  They select a desired paraphrasing `mode` from a dropdown menu.
4.  The client calls the `/api/ai/writing-tools/paraphrase` endpoint.
5.  The API route invokes the `paraphraseText` flow, passing the appropriate instruction for the selected mode.
6.  The rewritten text is returned and displayed side-by-side with the original for comparison.
