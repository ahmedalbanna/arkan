This document outlines the AI Citation Generator tool.

## Purpose

The Citation Generator helps users create properly formatted academic citations from various sources, such as URLs, book titles, or blocks of text.

## Key Concepts

-   **AI Flow**: Wraps the `generateCitation` Genkit flow from `src/ai/flows/generate-citation.ts`.
-   **Style Support**: The tool supports multiple major citation styles (APA, MLA, Chicago, IEEE).
-   **Source Analysis**: The AI is prompted to analyze the provided source text, identify the necessary components (author, title, date, etc.), and format them according to the rules of the selected style.

## Workflow

1.  A user navigates to the "Citation Generator" page.
2.  They paste their source material (e.g., a URL) into the text area.
3.  They select the desired citation style from a dropdown menu.
4.  The client calls the `/api/writing-tools/citation-generator` endpoint.
5.  The API route invokes the `generateCitation` flow.
6.  The single, correctly formatted citation string is returned and displayed to the user for copying.
