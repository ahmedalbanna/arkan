This document outlines the architecture of the asynchronous AI generation workflow, which uses an external service (like Taskade) and Firebase Realtime Database for efficient, non-blocking tasks.

## 1. Core Concept: Event-Driven Architecture

Instead of the client continuously asking "Is it done yet?" (polling), this system uses an event-driven approach. The client starts a job and then listens for a completion event. This is more efficient and scalable.

1.  **Client Starts a Job**: The user interface calls an API endpoint (`/api/generate/start`) to begin a task.
2.  **Job ID Returned Immediately**: The API creates a unique `jobId`, stores its initial "pending" status in the **Firebase Realtime Database**, and immediately returns the `jobId` to the client.
3.  **Client Listens for Changes**: The client uses the `jobId` to subscribe directly to its specific entry in the Realtime Database (`/jobs/{jobId}`).
4.  **Asynchronous Task Execution**: The API triggers an external webhook (e.g., Taskade) to perform the heavy lifting (like AI generation).
5.  **Result Sent to Webhook**: When the external service is finished, it sends the result to a callback webhook in our application (`/api/webhooks/taskade-result`).
6.  **Database Update**: Our webhook receives the result and updates the corresponding job's entry in the Realtime Database, changing its status to "completed" and adding the result data.
7.  **Real-Time UI Update**: Because the client is listening to that specific job entry, the Firebase SDK automatically pushes the change to the client the moment it happens. The UI updates instantly to show the result.

## 2. Key Components

### `src/lib/job-store.ts`

-   **Purpose**: This is the data layer for managing job state. It contains functions to create, update, and retrieve job information from the **Firebase Realtime Database**.
-   **Security**: It also includes a function to generate a secure, single-use token for each job, which is passed to the external service to authenticate the callback.

### `src/hooks/use-taskade.ts`

-   **Purpose**: This custom React hook encapsulates all the client-side logic.
-   **`startGeneration`**: Calls the service to start the job and gets back the `jobId`.
-   **Real-time Listener**: The hook's `useEffect` subscribes to the Realtime Database path for the current `jobId`. It handles all state changes (`pending`, `completed`, `failed`) pushed by Firebase.

### API Endpoints

-   **`POST /api/generate/start`**:
    -   Receives the prompt and desired output format (`string` or `json`).
    -   Reads the webhook configuration from `src/lib/taskade-workflow.json`.
    -   Creates a new job in the Realtime Database via `job-store.ts`.
    -   Triggers the external Taskade webhook without waiting for a response.
    -   Returns the `jobId` to the client.

-   **`POST /api/webhooks/taskade-result`**:
    -   Receives the result from Taskade.
    -   Verifies the secure job token to ensure the request is legitimate.
    -   Updates the job's status and result in the Realtime Database via `job-store.ts`.

### `src/lib/taskade-workflow.json`

-   **Purpose**: A configuration file that defines the contract for our interaction with the Taskade webhook, including its URL and the expected input/output schemas. This makes the integration easy to manage without changing code.
