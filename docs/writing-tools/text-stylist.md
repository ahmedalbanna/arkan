This document outlines the TextStylist.ai tool, which combines rewriting and summarizing functionalities.

## Purpose

TextStylist.ai is a multi-functional tool that allows users to refine a piece of text by either rewriting it in a variety of styles or summarizing it to a specific length.

## Key Concepts

-   **AI Flows**:
    -   Rewrite functionality wraps the `rewriteText` Genkit flow from `src/ai/flows/text-stylist.ts`.
    -   Summarize functionality wraps the `summarizeTextWithRatio` Genkit flow from the same file.
-   **Rewriting Styles**: Offers a wide range of stylistic targets (e.g., Formal, Creative, Simple, Technical) that are passed as instructions to the AI.
-   **Summarization by Ratio**: Instead of fixed lengths, this tool allows the user to specify a desired compression ratio (from 10% to 90%) for the summary, offering more granular control over the output length.
-   **Diff View**: For rewrites, the UI provides a "diff" view that highlights the specific words and phrases that were added or removed, making it easy to see the AI's changes.

## Workflow

1.  A user navigates to the "TextStylist.ai" page.
2.  They enter their text.
3.  **For Rewriting**: They select a style and click "Rewrite." This calls the `/api/writing-tools/rewrite-text` endpoint.
4.  **For Summarizing**: They adjust the compression ratio slider and click "Summarize." This calls the `/api/writing-tools/summarize-with-ratio` endpoint.
5.  The processed text is returned and displayed side-by-side with the original for easy comparison.
