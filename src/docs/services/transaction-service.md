
This code defines the service layer for handling payment transaction data, specifically for administrative actions.

**1. Purpose**

- The `transaction-service.ts` file is responsible for the raw `fetch` calls to the payment-related API endpoints, such as `/api/admin/transactions/pending` and `/api/admin/verify-payment`.

**2. Key Concepts**

-   **Service Layer**: This module isolates the network communication logic. Its functions are simple wrappers around `fetch` that handle constructing the request and parsing the response.
-   **Authentication**: All functions in this service require an admin's authentication token. This token is sent in the `Authorization` header to secure the endpoints and ensure only administrators can view and act on payment transactions.
-   **Hook Integration**: These service functions are used by the custom hooks in `src/hooks/use-transactions.ts`. Specifically, the `verifyPaymentApi` function is called by the `useVerifyPayment` mutation hook, which manages the API request state and handles cache invalidation upon success.

**3. Key Functions**

-   **`getPendingTransactions(params)`**: Fetches a paginated list of transactions with a 'pending' status.
-   **`verifyPayment(variables, token)`**: Sends a request to the backend to either approve or reject a specific transaction.
