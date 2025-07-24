This document outlines the API endpoints that power the Homework Solver feature, which mirrors the architecture of the Exam Solver.

### POST `/api/homework-solver/analyze`

-   **Purpose**: The first step in the workflow. It takes the raw markdown content extracted from a user's uploaded PDF and uses an AI agent to analyze and structure it.
-   **AI Flow**: It calls the `analyzeHomework` flow from `src/ai/flows/homework-solver.ts`.
-   **Output**: Returns a structured `AnalyzedHomework` object containing the homework's subject, title, and a cleaned-up version of the questions.
-   **Credits**: This action costs **1 credit**.

### POST `/api/homework-solver/solve`

-   **Purpose**: The second step. It takes the structured `AnalyzedHomework` object and uses an AI agent to generate solutions.
-   **AI Flow**: It calls the `solveHomework` flow from `src/ai/flows/homework-solver.ts`.
-   **Output**: Returns a `SolvedHomework` object containing an array of question-and-solution pairs.
-   **Credits**: This action costs **2 credits**.

**Workflow Summary:**

1.  The user uploads a PDF on the Homework Solver page.
2.  The client first calls `/api/pdf-to-markdown` to get the raw text.
3.  Then, it calls `/api/homework-solver/analyze` with the markdown content.
4.  The UI displays the analyzed, structured homework.
5.  When the user clicks "Solve Homework", the client calls `/api/homework-solver/solve` with the `AnalyzedHomework` object.
6.  The final solutions are displayed to the user.