This document outlines the Topic Explainer tool.

## Purpose

The Topic Explainer is an educational tool that takes a complex topic or term from the user and generates a simple, easy-to-understand explanation suitable for a beginner.

## Key Concepts

-   **AI Flow**: Wraps the `topicExplainer` Genkit flow from `src/ai/flows/topic-explainer.ts`.
-   **Simplified Explanations**: The AI is specifically prompted to avoid jargon, use analogies, and structure the explanation logically with clear headings and bullet points to maximize clarity.
-   **Markdown Output**: The generated explanation is formatted in Markdown for easy readability and integration into other documents.

## Workflow

1.  A user navigates to the "Topic Explainer" page.
2.  They enter the topic they want to understand (e.g., "Quantum Entanglement", "Blockchain").
3.  The client calls the `/api/writing-tools/topic-explainer` endpoint.
4.  The API route invokes the `topicExplainer` flow.
5.  The generated Markdown explanation is returned and displayed in a formatted view.
