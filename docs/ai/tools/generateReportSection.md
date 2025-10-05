
This document outlines the `generateReportSection` AI tool.

## Purpose

The `generateReportSection` tool allows the `projectChat` agent to generate content for any specific section of the project report (e.g., introduction, conclusion, system analysis).

## How It Works

When a user asks the `projectChat` agent to "write the introduction for my report" or "generate the conclusion," the agent identifies the `section` name from the request. It then calls this tool with the appropriate section name.

The tool itself is a wrapper around the main `generateReportSection` AI flow. The calling flow (`projectChat`) provides the necessary project context (like the proposal) to the underlying flow, ensuring the generated content is relevant.

## Parameters

-   **`section` (enum)**: The specific section to be generated. This must be a valid `SectionName` from the schema (e.g., `'introduction'`, `'systemDesign'`).

## Output

The tool returns the output from the `generateReportSection` flow, which is an object containing the `sectionName` and the generated markdown `content`. The client-side application then updates the `useReportStore` with this new content.
