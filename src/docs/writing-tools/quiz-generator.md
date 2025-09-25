This document outlines the AI Quiz Generator tool.

## Purpose

The Quiz Generator allows users to automatically create a multiple-choice quiz from any block of text, such as lecture notes, articles, or textbook chapters.

## Key Concepts

-   **AI Flow**: Wraps the `generateQuiz` Genkit flow from `src/ai/flows/generate-quiz.ts`.
-   **Customizable Length**: The user can specify the number of questions to generate (from 1 to 10).
-   **Structured Output**: The AI is prompted to return an array of `questions`, where each question object contains the question text, an array of 4 options, and the correct answer.

## Workflow

1.  A user navigates to the "AI Quiz Generator" page.
2.  They paste the source text into the text area.
3.  They use a slider to select the desired number of questions.
4.  The client calls the `/api/writing-tools/generate-quiz` endpoint.
5.  The API route invokes the `generateQuiz` flow.
6.  The structured quiz data is returned to the client and displayed in an interactive format where answers can be shown or hidden.
