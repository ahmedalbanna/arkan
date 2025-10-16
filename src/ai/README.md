# AI Architecture

This directory contains all the logic for the application's generative AI features, built using the **Genkit** framework. The architecture is designed to be modular, maintainable, and flexible, following a strict "separation of concerns" principle.

## Core Directories

### 1. `config/`

-   **Purpose**: Centralizes all static configurations for the AI system.
-   **`models.ts`**: Defines and exports all AI models used in the application (e.g., `defaultModel`, `proModel`). If you need to upgrade a model or switch to a different one, you only need to change it in this one file.

### 2. `prompts/`

-   **Purpose**: Contains all prompt definitions. Each file in this directory is responsible for defining a specific `ai.definePrompt(...)`.
-   **Benefits**: Separating prompts from the flow logic makes it easy to iterate on, test, and fine-tune the AI's behavior without touching the core business logic. It also allows non-developers to more easily review and understand the instructions given to the AI.

### 3. `flows/`

-   **Purpose**: Holds the core business logic for each AI task.
-   **Structure**: Each flow should be a simple orchestrator. It imports its required `model` from `config/` and its `prompt` from `prompts/`, and then executes the generative call. Flows should contain minimal hardcoded values.

### 4. `tools/`

-   **Purpose**: Defines any external tools or functions that AI flows can call to perform actions or retrieve information from outside the generative model (e.g., fetching data from a database, calling an external API).

### 5. `schemas/`

-   **Purpose**: Contains all **Zod** schema definitions.
-   **Function**: These schemas act as the "contract" for all data moving through the AI system. They are used in `ai.defineFlow()` and `ai.definePrompt()` to validate inputs and, more importantly, to instruct the AI on the exact format for its output. Strict adherence to these schemas is crucial for system reliability.

## Development Workflow

### How to Add a New AI Feature

1.  **Define Schemas**: In `src/ai/schemas/`, define the Zod schemas for the new feature's input and output.
2.  **Create a Prompt**: In `src/ai/prompts/`, create a new file (e.g., `myNewPrompt.ts`) and use `ai.definePrompt()` to define the instructions for the AI. Import your model from `config/` and your schemas from `schemas/`.
3.  **Create a Flow**: In `src/ai/flows/`, create the flow file (e.g., `myNewFlow.ts`). Import your newly defined prompt and wrap it in an `ai.defineFlow()`.
4.  **Expose via API**: Create a new API route in `src/app/api/` that calls your new flow.
5.  **Build the UI**: Create the frontend components and hooks necessary to call the new API endpoint.
