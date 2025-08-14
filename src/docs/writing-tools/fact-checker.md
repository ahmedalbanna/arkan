This document outlines the AI Fact Checker tool.

## Purpose

The AI Fact Checker is designed to analyze a piece of text, identify verifiable claims, and check their accuracy against reliable web sources.

## Key Concepts

-   **AI Flow**: Wraps the `factCheckText` Genkit flow from `src/ai/flows/fact-checker.ts`.
-   **Claim Extraction**: The AI is prompted to first read through the text and pull out specific, factual statements.
-   **Verification and Sourcing**: For each claim, the AI determines a status ('Verified', 'False', 'Inconclusive') and provides a reliable source URL to back up its finding.
-   **Originality Score**: The tool provides an overall score from 0-100 to represent the factual accuracy of the text.
-   **Credit Cost**: This is a complex task involving web search and costs **2 credits** per use.

## Workflow

1.  A user navigates to the "Fact Checker" page.
2.  They paste the text they wish to check.
3.  The client calls the `/api/writing-tools/fact-checker` endpoint.
4.  The API route invokes the `factCheckText` flow.
5.  The structured report, including each claim's status, explanation, and source, is returned to the client and displayed in the UI.
