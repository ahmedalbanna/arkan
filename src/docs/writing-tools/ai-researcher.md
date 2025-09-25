This document outlines the AI Researcher tool.

## Purpose

The AI Researcher acts as an automated research assistant. It takes a topic from the user, conducts web research, and synthesizes the findings into a structured report.

## Key Concepts

-   **AI Flow**: Wraps the `aiResearcher` Genkit flow from `src/ai/flows/ai-researcher.ts`.
-   **Structured Output**: The AI is prompted to return a well-organized JSON object containing three key parts:
    1.  `summary`: A comprehensive overview of the topic.
    2.  `keyPoints`: A bulleted list of the most important facts or findings.
    3.  `sources`: A list of the URLs that were used as primary sources for the research.
-   **Credit Cost**: This is a more complex task involving web search and synthesis, so it costs **2 credits** per use.

## Workflow

1.  A user navigates to the "AI Researcher" page.
2.  They enter a research topic into the input field.
3.  The client calls the `/api/ai/writing-tools/ai-researcher` endpoint.
4.  The API route invokes the `aiResearcher` flow.
5.  The structured research report is returned to the client and displayed in a formatted view.
