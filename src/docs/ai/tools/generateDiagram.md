
This document outlines the `generateDiagram` AI tool.

## Purpose

The `generateDiagram` tool gives the `projectChat` agent the ability to generate any of the standard system diagrams (e.g., Use Case, Class, Sequence) based on the project's overall context.

## How It Works

When a user makes a request like "draw me a class diagram for the user authentication module," the `projectChat` agent identifies the user's intent to create a diagram. It extracts the specific `diagramType` from the user's message and calls this tool.

The tool then invokes the main `generateDiagram` AI flow. The calling flow (`projectChat`) is responsible for providing the full project context (proposal, report sections, etc.) to ensure the generated diagram is accurate and consistent with the rest of the project.

## Parameters

-   **`diagramType` (enum)**: The specific type of diagram to generate. Must be one of the following:
    -   `'use-case'`
    -   `'class'`
    -   `'sequence'`
    -   `'activity'`
    -   `'component'`
    -   `'archimate'`
    -   `'er'`

## Output

The tool returns the output of the `generateDiagram` flow, which includes the `plantUmlCode` and the `imageUrl` for the generated diagram. The client-side application then uses this data to update the `useDiagramStore` and display the new diagram.
