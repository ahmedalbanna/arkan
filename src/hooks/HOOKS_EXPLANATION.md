# Hooks Explanation

This document provides an overview of the custom React hooks used in this project, located in the `src/hooks` directory. These hooks encapsulate various pieces of logic, state management, and API interactions to provide reusable functionality across the application.

## `use-agents.ts`

- **Purpose:** Manages fetching and updating AI agents.
- **Functionality:** Provides hooks to fetch a list of all agents (`useAgents`) and to fetch a specific agent by ID (`useAgent`). It also includes a mutation hook (`useUpdateAgent`) for updating agent configurations.
- **Dependencies:** Depends on `@tanstack/react-query` for data fetching and caching, `useAuth` for authentication tokens, and `@/lib/agents` for agent type definitions. It also utilizes the `handleErrorUtility` for standardized error reporting.
- **Notes:** The `useAgent` hook is enabled only when both the `firebaseUser` is available and an `agentId` is provided.

## `use-autosave.ts`

- **Purpose:** Implements an autosave feature for project changes.
- **Functionality:** Monitors the `hasUnsavedChanges` flag from `useBuilderStore`. When changes are detected and debounced, it triggers either `useSaveProject` (for new projects) or `useUpdateProject` (for existing projects) to persist the current project state.
- **Dependencies:** Depends on `useBuilderStore` for project state, `useSaveProject` and `useUpdateProject` for saving/updating, and `useDebounce` to prevent excessive save operations.
- **Notes:** Saving only occurs if there is a `proposal` in the builder store. Uses a ref to track the saving state and avoid infinite loops.

## `use-debounce.ts`

- **Purpose:** A utility hook to debounce a value.
- **Functionality:** Delays updating the output value until a specified `delay` has passed without the input `value` changing.
- **Dependencies:** Standard React hooks (`useState`, `useEffect`).
- **Notes:** Useful for optimizing performance in scenarios like input fields where you only want to perform an action after the user has stopped typing for a short period.

## `use-docx-styles.ts`

- **Purpose:** Manages fetching and updating styles for DOCX document generation.
- **Functionality:** Provides a hook (`useDocxStyles`) to fetch available DOCX templates and their styles, and a mutation hook (`useRefreshTemplateImage`) to refresh the preview image for a template. It includes functions to `updateStyle` locally in the cache and `saveChanges` to persist them via an API call.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication, and `@/hooks/use-toast` for notifications. It also uses the `handleErrorUtility`.
- **Notes:** Styles are fetched once and cached. Local changes are applied immediately using `queryClient.setQueryData` before being saved.

## `use-features.ts`

- **Purpose:** Manages fetching and updating application feature flags.
- **Functionality:** Provides a hook (`useFeatures`) to fetch the list of available features and their enabled status, and a mutation hook (`useUpdateFeature`) to toggle feature flags.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication, and `@/lib/query-keys` for query key management. It uses the `handleErrorUtility` for errors and implements optimistic updates for feature toggling.
- **Notes:** Optimistic updates provide a smoother user experience when toggling features.

## `use-history.ts`

- **Purpose:** Manages a local history of generated content (currently unused in the main application flow but available).
- **Functionality:** Provides functions to add an entry to the history, clear the history, and access the history list. Stores data in `localStorage`.
- **Dependencies:** Standard React hooks (`useState`, `useEffect`, `useCallback`).
- **Notes:** History is stored client-side in `localStorage`. Currently capped at the last 20 entries.

## `use-mobile.tsx`

- **Purpose:** Determines if the application is being viewed on a mobile device based on screen width.
- **Functionality:** Returns a boolean indicating whether the current window width is less than the defined `MOBILE_BREAKPOINT`.
- **Dependencies:** Standard React hooks (`useState`, `useEffect`).
- **Notes:** Uses `window.matchMedia` for responsive checking and updates the state on window resize.

## `use-pptx-styles.ts`

- **Purpose:** Manages fetching and updating styles for PPTX presentation generation.
- **Functionality:** Similar to `use-docx-styles.ts`, it provides hooks (`usePptxStyles` and `useRefreshPptxTemplateImage`) to fetch PPTX templates and styles, update styles locally, save changes via API, and refresh preview images. Includes a helper function `set` for updating nested style properties.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth`, `@/hooks/use-toast`. Uses `handleErrorUtility`.
- **Notes:** Works similarly to `useDocxStyles` for managing presentation styles.

## `use-projects.ts`

- **Purpose:** Manages fetching, saving, updating, and deleting user projects.
- **Functionality:** Provides hooks to fetch a list of projects (`useProjects`), fetch a single project (`useProject`), and mutations for `useSaveProject`, `useUpdateProject`, and `useDeleteProject`.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication, `@/lib/query-keys` for query keys, and `@/services/project-service` for API interactions. Also uses `useBuilderStore` to update the current project ID and unsaved changes status. Utilizes `handleErrorUtility`.
- **Notes:** `useProject` is enabled only when a `projectId` and `firebaseUser` are available.

## `use-sound.ts`

- **Purpose:** Provides functionality to play simple UI sounds.
- **Functionality:** Initializes the `ion-sound` library on the client-side and provides a `playSound` function to play 'success' or 'error' sounds.
- **Dependencies:** Dynamically imports the `ion-sound` library and uses standard React hooks.
- **Notes:** Ensures sound initialization only happens in the browser environment.

## `use-templates.ts`

- **Purpose:** Manages fetching and updating various generation templates (proposal, report, presentation).
- **Functionality:** Provides hooks to fetch lists of different template types (`useProposalTemplates`, `useReportTemplates`, `usePresentationTemplates`) and mutation hooks to update them (`useUpdateProposalTemplate`, `useUpdateReportTemplate`, `useUpdatePresentationTemplate`).
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication, `@/services/template-service` for API interactions, and `@/lib/query-keys` for query keys. Uses `handleErrorUtility` for error handling.
- **Notes:** Templates are cached for 5 minutes.

## `use-toast.ts`

- **Purpose:** Provides a system for displaying transient notifications (toasts).
- **Functionality:** Manages a queue of toasts, their display, and removal. Integrates with `useSound` to play sounds for different toast variants.
- **Dependencies:** Depends on `@/components/ui/toast` for UI components and `useSound` for audio feedback. Uses standard React hooks and a custom reducer for state management.
- **Notes:** This hook is the provider for the `toast` function used throughout the application, including within `handleErrorUtility`.

## `use-transactions.ts`

- **Purpose:** Manages user transactions, specifically for verifying payments.
- **Functionality:** Provides a mutation hook (`useVerifyPayment`) to verify user payments and grant credits.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication (admin privileges), `@/lib/query-keys` for query invalidation, and `@/hooks/use-toast`. Uses `handleErrorUtility`.
- **Notes:** Invalidates user and pending transaction queries on success to refresh displayed data.

## `use-translation.ts`

- **Purpose:** Provides functionality for translating text using an AI flow.
- **Functionality:** Offers a mutation hook (`useTranslate`) to send text and a target language to an API endpoint for translation.
- **Dependencies:** Depends on `@tanstack/react-query`, `useAuth` for authentication, and `@/ai/flows/translate-text` for the output type. Uses `handleErrorUtility` for error handling.
- **Notes:** Invalidates the user query on successful translation, likely to reflect credit usage.

## `use-user.ts`

- **Purpose:** Manages user authentication and profile data.
- **Functionality:** Provides hooks for fetching user profile data (`useUserProfile`) and mutations for various authentication actions like `useLogin`, `useGoogleSignIn`, `useLogout`, `useSignup`, `useSendPasswordReset`, `useForgotPassword`, and `usePhoneSignIn`. Includes handling for Firebase authentication flows.
- **Dependencies:** Depends on `@tanstack/react-query`, `next/navigation` for routing, `firebase/auth` for authentication logic, `@/lib/firebase` for Firebase app instance, `@/services/user-service` for profile fetching, and `@/context/AuthContext` for managing the authenticated user state. Uses `handleErrorUtility` for various error scenarios.
- **Notes:** Handles different authentication methods and integrates with the application's authentication context.

## Zustand Stores (Located in `src/hooks` but not `use-` prefixed utility hooks)

These files define Zustand stores for managing specific parts of the application's state. They do not use `react-query`'s `onError` callbacks directly, as their state management is handled internally by Zustand.

- **`useBuilderStore.ts`:** Manages the core state of the project builder, including the project idea, proposal, current project ID, and unsaved changes. Also coordinates state loading and resetting for other stores.
- **`useCodeGeneratorStore.ts`:** Manages the state related to the code generation feature, including the prompt and the generated HTML, CSS, and JavaScript.
- **`useDiagramStore.ts`:** Manages the state of generated diagrams, storing PlantUML code and image URLs for different diagram types.
- **`useExamSolverStore.ts`:** Manages the state for the exam solver feature, including the current stage, analyzed exam data, solved exam data, and a history of solved exams.
- **`useHomeworkSolverStore.ts`:** Manages the state for the homework solver feature, similar to the exam solver but for homework.
- **`usePresentationStore.ts`:** Manages the state of generated presentations, including a history of presentations and the currently active presentation.
- **`useReportStore.ts`:** Manages the state for the report generation feature, including section content, evaluation results, external context, and various UI control states for generation.

## `handleErrorUtility.ts`

- **Purpose:** A shared utility function for standardized error handling and reporting using toast notifications.
- **Functionality:** Takes an error object and an optional context string. It attempts to extract a meaningful error message from the error object and displays a destructive toast notification with the provided context (or a generic "Error" title) and the extracted/default error message.
- **Dependencies:** Depends on `@/hooks/use-toast`.
- **Notes:** This utility is used by many of the react-query hooks to provide consistent error feedback to the user.
