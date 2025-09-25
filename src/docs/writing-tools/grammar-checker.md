This document outlines the AI Grammar Checker tool.

## Purpose

The Grammar Checker analyzes a piece of text for grammatical errors, spelling mistakes, and punctuation issues. It provides both a fully corrected version of the text and a list of the specific changes made with explanations.

## Key Concepts

-   **AI Flow**: Wraps the `grammarCheck` Genkit flow from `src/ai/flows/grammar-checker.ts`.
-   **Markdown Preservation**: The AI is specifically prompted to preserve all original Markdown formatting (headings, lists, etc.) in the corrected version.
-   **Structured Corrections**: The output includes a `corrections` array, where each item contains the original snippet, the corrected snippet, and a simple explanation of the grammatical rule that was applied.

## Workflow

1.  A user navigates to the "Grammar Checker" page.
2.  They paste their text into the text area.
3.  The client calls the `/api/ai/writing-tools/grammar-checker` endpoint.
4.  The API route invokes the `grammarCheck` flow.
5.  The result, containing both the `correctedText` and the `corrections` array, is returned to the client and displayed in a side-by-side view.
