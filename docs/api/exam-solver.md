This document outlines the API endpoints that power the Exam Solver feature. This feature uses a two-step AI process: first analyzing the exam, then solving it.

### POST `/api/exam-solver/analyze`

-   **Purpose**: The first step in the workflow. It takes the raw markdown content extracted from a user's uploaded PDF and uses an AI agent to analyze and structure it.
-   **AI Flow**: It calls the `analyzeExam` flow from `src/ai/flows/exam-solver.ts`.
-   **Output**: Returns a structured `AnalyzedExam` object containing the exam's subject, specialty, and a cleaned-up version of the questions in markdown format.
-   **Credits**: This action costs **1 credit**.

### POST `/api/exam-solver/solve`

-   **Purpose**: The second step. It takes the structured `AnalyzedExam` object from the analysis step and uses an AI agent to generate solutions for each question.
-   **AI Flow**: It calls the `solveExam` flow from `src/ai/flows/exam-solver.ts`.
-   **Output**: Returns a `SolvedExam` object containing an array of question-and-solution pairs.
-   **Credits**: This is a more intensive task and costs **3 credits**.

**Workflow Summary:**

1.  The user uploads a PDF on the Exam Solver page.
2.  The client first calls `/api/pdf-to-markdown` to get the raw text.
3.  Then, it calls `/api/exam-solver/analyze` with the markdown content.
4.  The UI displays the analyzed, structured exam.
5.  When the user clicks "Solve Exam", the client calls `/api/exam-solver/solve` with the `AnalyzedExam` object.
6.  The final solutions are displayed to the user.