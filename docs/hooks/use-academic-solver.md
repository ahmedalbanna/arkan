
This document breaks down the `useAcademicSolverStore` Zustand store, which manages the state for the unified Academic Solver feature.

## 1. Purpose

The `useAcademicSolverStore` is the central state management unit for the entire academic document workflow. It handles the different stages of the process, from file upload to final solution, and manages the data for both exams and homework in a single, cohesive store.

## 2. State (`AcademicSolverState`)

-   `stage`: Tracks the current step of the process (`'idle'`, `'analyzing'`, `'readyToSolve'`, `'solving'`, `'solved'`).
-   `documentType`: Stores whether the user has selected 'exam' or 'homework'.
-   `analyzedDocument`: Holds the structured `AnalyzedDocument` object returned by the analysis AI flow. This includes the subject, title, language, and cleaned markdown content.
-   `solvedDocument`: Holds the `SolvedDocument` object returned by the solving AI flow, which contains the array of solutions.
-   `questionDocuments`: An array of `ExternalContext` objects (`{ fileName, content }`) representing all the documents the user has uploaded for the questions.
-   `externalContext`: An array of `ExternalContext` objects representing all the supplementary materials (syllabus, textbook pages, etc.) uploaded by the user.

## 3. Actions (`AcademicSolverActions`)

-   **`setStage`**: Updates the current stage of the workflow.
-   **`setDocumentType`**: Sets whether the document is an 'exam' or 'homework'.
-   **`setAnalyzedDocument`**: Stores the result from the analysis API call and transitions the stage to `readyToSolve`.
-   **`setSolvedDocument`**: Stores the result from the solving API call and transitions the stage to `solved`.
-   **`addQuestionDocument`**: Adds a new document (from a PDF, image, or text paste) to the `questionDocuments` array.
-   **`removeQuestionDocument`**: Removes a specific question document from the list.
-   **`addExternalContext`**: Adds a new document to the `externalContext` array.
-   **`removeExternalContext`**: Removes a specific context document from the list.
-   **`newSession`**: Resets the store to its initial state, allowing the user to start a new academic solving session.
-   **`loadState`**: Loads a saved academic solver state from a larger project state object, which is useful when loading a saved project.
-   **`resetCurrent`**: Clears the store and resets the UI to its initial state, ready for a new session.
