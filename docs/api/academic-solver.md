This document outlines the API endpoints that power the unified Academic Solver feature. This feature uses a two-step AI process: first analyzing the academic document (exam or homework), then solving it.

### POST `/api/academic-solver/analyze`

-   **Purpose**: The first step in the workflow. It takes raw markdown content extracted from a user's uploaded document (PDF, image text, etc.) and uses an AI agent to analyze and structure it.
-   **AI Flow**: It calls the `analyzeAcademicDocument` flow from `src/ai/flows/academic-solver.ts`.
-   **Output**: Returns a structured `AnalyzedDocument` object containing the document's type (exam/homework), subject, title, language, and a cleaned-up version of the questions in markdown format.
-   **Credits**: This action costs **1 credit**.

### POST `/api/academic-solver/solve`

-   **Purpose**: The second step. It takes the structured `AnalyzedDocument` object from the analysis step and uses an AI agent to generate solutions for each question.
-   **AI Flow**: It calls the `solveAcademicDocument` flow from `src/ai/flows/academic-solver.ts`. The flow now uses the `language` field from the analyzed document to provide solutions in the same language.
-   **Output**: Returns a `SolvedDocument` object containing an array of question-and-solution pairs.
-   **Credits**: This is a more intensive task. It costs **3 credits** for an 'exam' and **2 credits** for 'homework'.

**Workflow Summary:**

1.  The user uploads one or more documents (PDF, image, or pasted text) on the Academic Solver page.
2.  The client first calls `/api/pdf-to-markdown` or `/api/image-to-text` if needed to get raw text.
3.  Then, it calls `/api/academic-solver/analyze` with the combined markdown content.
4.  The UI displays the analyzed, structured document.
5.  When the user clicks "Solve Document", the client calls `/api/academic-solver/solve` with the `AnalyzedDocument` object.
6.  The final solutions are displayed to the user.