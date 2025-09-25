This document outlines the AI Plagiarism Checker tool.

## Purpose

The Plagiarism Checker analyzes a block of text for originality by comparing it against web sources to find potential matches.

## Key Concepts

-   **AI Flow**: Wraps the `plagiarismCheck` Genkit flow from `src/ai/flows/plagiarism-checker.ts`.
-   **Source Matching**: The AI is prompted to search for real, accessible URLs that contain content similar to the user's text.
-   **Structured Output**: The tool returns a list of `matches`, where each match includes the source URL, the title of the source page, a summary of the matching content, and a similarity percentage.
-   **Originality Score**: An overall originality score from 0-100 is provided to give the user a quick assessment of the text's uniqueness.
-   **Credit Cost**: This is a complex task involving web search and costs **2 credits** per use.

## Workflow

1.  A user navigates to the "Plagiarism Checker" page.
2.  They paste their text into the input field.
3.  The client calls the `/api/ai/writing-tools/plagiarism-checker` endpoint.
4.  The API route invokes the `plagiarismCheck` flow.
5.  The structured report, including the originality score and detailed matches, is returned to the client.
