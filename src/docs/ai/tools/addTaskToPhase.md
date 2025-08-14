
This document outlines the `addTaskToPhase` AI tool.

## Purpose

The `addTaskToPhase` tool is designed to allow the `projectChat` AI agent to programmatically add a new task or user story to a specific phase of the project plan.

## How It Works

When a user gives a command like "add a task to Sprint 1 to implement user login," the `projectChat` agent can recognize this intent. It then formulates the necessary data (task title, description, acceptance criteria) based on the user's request and calls this tool.

The tool itself doesn't directly modify the state. Instead, it returns a structured object containing the details of the task to be added. The client-side application receives this object and uses it to update the `useProjectPlanStore`, providing instant feedback to the user in the UI.

## Parameters

-   **`phaseName` (string)**: The exact name of the phase to which the task should be added.
-   **`task` (object)**: An object conforming to the `ProjectTaskSchema`, containing:
    -   `title` (string)
    -   `description` (string)
    -   `acceptanceCriteria` (array of strings)

## Output

Returns a JSON object confirming the action and echoing the data that was added:
`{ success: true, added: { phaseName, task } }`
