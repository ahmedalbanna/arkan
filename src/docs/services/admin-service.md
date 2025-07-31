This code defines a service function for fetching administrative dashboard statistics from the backend API.

**1. Purpose**

- The `admin-service.ts` file acts as the dedicated data-fetching layer for all administrative dashboard-related information. Its sole responsibility is to communicate with the `/api/admin/dashboard-stats` endpoint.

**2. Key Concepts**

-   **Service Layer**: This file is part of the service layer, which means it contains only the raw `fetch` call. It abstracts away the details of the API endpoint and the request headers.
-   **Data Fetching**: It exports an async function `fetchDashboardStats` that takes an authentication token, makes the API request, and returns the parsed JSON data.
-   **Hook Layer Integration**: This service is called by the `useQuery` hook located within the `src/components/admin/Dashboard.tsx` component to fetch and cache the statistics for the admin dashboard.

**In summary:**

The `admin-service.ts` file isolates the network logic for fetching dashboard stats. This separation keeps the `Dashboard` component clean and focused on rendering data, while the service handles the specifics of the API call.
