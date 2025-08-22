
This document outlines the API endpoint responsible for fetching statistics for the admin dashboard.

**Endpoint**: `GET /api/admin/dashboard-stats`

**1. Purpose**

- This endpoint serves as the data source for the main admin dashboard. It aggregates various statistics from Firestore to provide a high-level overview of application activity.

**2. Key Concepts**

-   **Admin-Only Access**: The endpoint is protected and can only be accessed by users with an 'admin' role. It verifies the caller's JWT and checks their role in the database.
-   **Parallel Fetching**: It uses `Promise.all` to fetch multiple statistics concurrently, ensuring the dashboard loads quickly.
-   **Data Aggregation**: It performs several queries to count total users, total AI generations, and pending payment transactions. It also aggregates agent usage data and fetches the most recent generation activities.

**3. Workflow**

1.  An admin user navigates to the `/admin/dashboard` page.
2.  The `Dashboard` component's `useQuery` hook calls this endpoint by using the `fetchDashboardStats` function from `src/services/admin-service.ts`.
3.  The route handler verifies the admin's token.
4.  It executes multiple Firestore queries in parallel.
5.  It formats the results into a `DashboardStats` object and returns it as JSON.
6.  The `Dashboard` component renders the statistics in various stat cards and charts.

