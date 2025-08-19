
This code defines the service layer for managing all types of generation templates (proposal, report, and presentation).

**1. Purpose**

- The `template-service.ts` file acts as a centralized module for all `fetch` calls related to the `/api/admin/templates/*` backend endpoints. It handles the raw network communication for fetching and updating the various templates used in the application's generation flows.

**2. Key Concepts**

-   **Service Layer**: This file strictly contains API interaction logic. It abstracts away the endpoint details for each template type, providing a clear and consistent set of functions for the rest of the application.
-   **Authentication**: The `update`, `create`, and `delete` functions require an admin's authentication token to be passed in the `Authorization` header, ensuring that only authorized users can modify the templates. The `fetch` functions are public, as all users need access to the templates for generation.
-   **Hook Integration**: These service functions are the building blocks for the custom hooks defined in `src/hooks/use-templates.ts`. The `use...Templates` and `useUpdate...Template` hooks use these services to power their `useQuery` and `useMutation` calls, managing state, caching, and UI feedback.

**3. Key Functions**

The file provides a symmetric set of `fetch`, `create`, `update`, and `delete` functions for each template type:
-   **`fetchProposalTemplates()`** and **`updateProposalTemplate()`**
-   **`fetchReportTemplates()`** and **`updateReportTemplate()`**
-   **`fetchPresentationTemplates()`** and **`updatePresentationTemplate()`**

**In summary:**

The `template-service.ts` file provides a well-organized and efficient way to interact with the template APIs. By grouping all template-related `fetch` calls here, it promotes code reuse and makes it easy for the corresponding hooks to manage their specific state.
