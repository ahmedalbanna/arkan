This document describes the API endpoint for the Report Generator feature.

**Endpoint**: `POST /api/generate-report`

**1. Purpose**

-   This endpoint is responsible for generating content for the various sections of a project report. It can operate in two modes:
    1.  **Single Section Mode**: Generates content for one specific section (e.g., "Introduction").
    2.  **Full Report Mode**: Iterates through a list of sections defined in a template and generates them sequentially.

**2. Key Concepts**

-   **Authentication**: All requests must be authenticated with a user's JWT.
-   **Credit Deduction**:
    -   In single section mode, **1 credit** is deducted per call.
    -   In full report mode, credits are deducted upfront for *all* sections that will be generated in the batch.
-   **Contextual Generation**: Before generating a full report, this endpoint first calls the `evaluateAndSelectContext` AI flow. This "meta-agent" analyzes the existing project state and determines the optimal context (relevant sections, diagrams, etc.) and instructions for generating each subsequent section, leading to more coherent and context-aware results.
-   **AI Flow Integration**: The endpoint calls the `generateReportSection` flow for each section to be generated.

**3. Workflow (Full Report)**

1.  A user clicks "Generate Full Report" in the `GenerationTools` component.
2.  The client sends the project proposal, the report template ID, and any existing content to this endpoint.
3.  The route handler determines which sections are missing based on the template.
4.  It calls `evaluateAndSelectContext` to get a generation plan.
5.  It deducts the total required credits.
6.  It loops through the generation plan, calling the `generateReportSection` flow for each section and feeding the output of one step as potential context for the next.
7.  It returns a complete object containing all the newly generated sections to the client.