
This document breaks down the `src/lib/agents.ts` file, which is the central configuration point for all AI agents in the application.

## 1. Purpose

-   This file serves as a static, hard-coded definition for every AI agent. It defines their default properties, including their ID, name, description, category, and, most importantly, their core prompt.
-   On the first run, the data from this file is used to "seed" the `agents` collection in Firestore. After that, the application reads from Firestore, but this file remains the source of truth for static properties like the `icon`.

## 2. Key Concepts

-   **`Agent` Interface**: Defines the structure for an agent's configuration, including its unique `id`, human-readable `name`, `description`, `category`, the `pageUrl` where it's used, a default `isEnabled` status, and its `prompt`.
-   **`AgentPrompt` Type**: A prompt can be a simple string or a more complex object with a `base` prompt and an array of `guidelines`. This allows for more granular control over how an agent behaves.
-   **Centralized Configuration**: Having all agents defined in one place makes it easy to see all available AI capabilities at a glance and manage their default states.

## 3. Workflow

1.  When an admin first visits the "Manage Agents" page, the `/api/agents` route checks if the `agents` collection in Firestore is empty.
2.  If it is empty, the route reads this `agents.ts` file and writes each agent's configuration into a new Firestore document.
3.  When fetching agents, the API merges the dynamic data from Firestore (like a custom name or `isEnabled` status) with the static data from this file (like the `icon`) to provide a complete object to the frontend.

This file is the foundational blueprint for all AI functionality in the application.
