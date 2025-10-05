This document outlines the API endpoints for managing payment transactions, primarily for administrative review.

### GET `/api/transactions/pending`

-   **Purpose**: Fetches a paginated list of all transactions that have a `pending` status.
-   **Access**: This is a protected endpoint that can only be accessed by users with an 'admin' role.
-   **Pagination**: Supports cursor-based pagination using `limit` and `lastVisibleId` query parameters to efficiently load transactions as the admin scrolls or clicks "Load More".
-   **Usage**: Called by the `useInfiniteQuery` hook in the `PaymentVerificationConsole` component to display pending payment requests for admin review.

### POST `/api/verify-payment`

-   **Purpose**: Allows an administrator to approve or reject a pending payment transaction.
-   **Access**: Admin-only.
-   **Payload**: A JSON object containing the `transactionId`, the `userId` of the customer, the number of `creditsToGrant`, the new `status` ('verified' or 'rejected'), and optional `adminNotes`.
-   **Logic**:
    -   This endpoint uses a Firestore transaction to ensure atomicity.
    -   **If approved**: It updates the transaction document's status to `verified` AND atomically increments the user's `credits` balance in their user profile document.
    -   **If rejected**: It simply updates the transaction document's status to `rejected`.
-   **Usage**: Called by the `useVerifyPayment` mutation hook when an admin clicks the "Approve" or "Decline" button on a `PendingPaymentCard`.
