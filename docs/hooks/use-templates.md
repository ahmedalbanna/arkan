This code defines custom React hooks using TanStack Query for managing templates (proposal, report, and presentation templates). Let's break it down:

**1. Purpose**

- The `use-templates.ts` file provides React hooks for fetching, caching, and updating templates. It's likely part of an admin interface for managing the structure and content of the generated proposals, reports, and presentations. These hooks use TanStack Query for efficient data fetching and caching and interact with a backend API to manage template data.

**2. Key Concepts**

- **TanStack Query**: This library is used for data fetching, caching, and state management. The `useQuery` hook is used to fetch lists of templates, and `useMutation` is used for updating template data.
- **Backend API**: The hooks interact with a backend API (e.g., `/api/templates/proposal`) to fetch and update template data.
- **Authentication**: The `useAuth` hook (likely defined in `AuthContext.tsx`) provides access to the current Firebase user, which is used to obtain an authentication token for the API requests.
- **Error Handling**: The `handleErrorUtility` function (likely defined elsewhere) is used to handle errors and display user-friendly messages.
- **Query Keys**: The `templateKeys` object provides a consistent way to define query keys for TanStack Query, making it easier to invalidate and refetch data.

**3. Key Functions and Hooks**

- **`templateKeys`**: An object that defines the query keys used by TanStack Query. This helps to organize and manage the cache.
    - `all`: Base key for all template-related queries.
    - `proposals`: Key for proposal template queries.
    - `reports`: Key for report template queries.
    - `presentations`: Key for presentation template queries.
- **`useProposalTemplates()`**: A React hook that fetches a list of proposal templates.
    - It uses `useQuery` to fetch the data.
    - It calls the `fetchProposalTemplates` API function (likely from `src/services/template-service.ts`) to fetch the template data from the backend.
    - It caches the data for 5 minutes (`staleTime: 1000 * 60 * 5`).
    - It uses `handleErrorUtility` to handle errors.
- **`useReportTemplates()`**: A React hook that fetches a list of report templates.
    - It is structured similarly to `useProposalTemplates`, but fetches report templates using `fetchReportTemplates`.
- **`usePresentationTemplates()`**: A React hook that fetches a list of presentation templates.
    - It is structured similarly to `useProposalTemplates`, but fetches presentation templates using `fetchPresentationTemplates`.
- **`useUpdateProposalTemplate()`**: A React hook that updates a proposal template.
    - It uses `useMutation` to handle the update operation.
    - It retrieves an authentication token using `getAuthenticatedToken(firebaseUser)`.
    - It calls the `updateProposalTemplate` API function (likely from `src/services/template-service.ts`) to send the update request to the backend.
    - It invalidates the `templateKeys.proposals()` query to refetch the updated data.
    - It displays a success message using `toast` and handles errors using `handleErrorUtility`.
- **`useUpdateReportTemplate()`**: A React hook that updates a report template.
    - It is structured similarly to `useUpdateProposalTemplate`, but updates report templates using `updateReportTemplate`.
- **`useUpdatePresentationTemplate()`**: A React hook that updates a presentation template.
    - It is structured similarly to `useUpdateProposalTemplate`, but updates presentation templates using `updatePresentationTemplate`.

**4. Code Structure and Workflow**

1. **Fetching Templates**: The `useProposalTemplates`, `useReportTemplates`, and `usePresentationTemplates` hooks are used to fetch template data from the backend API and cache it using TanStack Query.
2. **Updating Templates**: The `useUpdateProposalTemplate`, `useUpdateReportTemplate`, and `useUpdatePresentationTemplate` hooks are used to update template data. They send the updated data to the backend API and invalidate the relevant queries to update the cache.
3. **Authentication**: All API requests are authenticated using a Firebase user's ID token.
4. **Error Handling**: The `handleErrorUtility` function is used to handle errors and display user-friendly messages.
5. **UI Updates**: After a successful update, the `toast` function is used to display a success message.

**In summary:**

The `use-templates.ts` file provides a set of React hooks for managing proposal, report, and presentation templates. It leverages TanStack Query for efficient data fetching and caching, interacts with a backend API to manage template data, and uses Firebase Authentication to secure the API requests. It provides a clean and consistent way to access and manipulate template data within the application.
