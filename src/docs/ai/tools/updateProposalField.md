
This document outlines the `updateProposalField` AI tool.

## Purpose

The `updateProposalField` tool provides a structured way for the `projectChat` agent to modify specific fields within the project proposal document based on a user's command.

## How It Works

When a user issues a command like "change the project title to 'E-commerce Platform'" or "update the total budget to 75000," the `projectChat` agent parses this request to identify three key pieces of information:

1.  The user's intent to **update** something.
2.  The **target field** to be changed (e.g., `title`, `budget.totalAmount`).
3.  The **new value** for that field.

The agent then calls this tool with the structured data. The tool's job is to simply return this structured request back to the client. The client-side application then uses this information to update the `useBuilderStore` and provide instant UI feedback. This approach avoids having the AI directly manipulate the state, which is safer and more predictable.

## Parameters

-   **`path` (string)**: The dot-notation path to the field to be updated (e.g., `'title'`, `'timeline.endDate'`).
-   **`value` (string | number | boolean)**: The new value to set for the specified field.

## Output

Returns a JSON object confirming the action and echoing the data that was updated:
`{ success: true, updated: { path, value } }`
