This document describes the API endpoint for handling manual payment proof submissions.

**Endpoint**: `POST /api/purchase-request`

**1. Purpose**

-   This endpoint facilitates an offline or manual payment workflow. It allows users to upload proof of payment (e.g., a bank transfer receipt), which an administrator can then review and verify.

**2. Key Concepts**

-   **Authentication**: The request must be authenticated with a user's JWT.
-   **File Upload**: The endpoint is configured to handle `multipart/form-data`, which is necessary for file uploads.
-   **Firebase Storage Integration**: It takes the uploaded file, gives it a unique name, and saves it to a `payment_proofs` directory in Firebase Storage.
-   **Transaction Record**: After successfully uploading the file, it creates a new document in the `transactions` collection in Firestore. This document has a `pending` status and contains all relevant information, including the user's details, the plan they purchased, and a signed URL to the proof of payment in Firebase Storage.

**3. Workflow**

1.  A user selects a pricing plan and is directed to the "Submit Payment" page.
2.  After making a manual bank transfer, they use the `SubmitPaymentForm` to select their receipt file.
3.  The frontend sends a `FormData` object containing the file and plan details to this endpoint.
4.  The route handler authenticates the user.
5.  It uploads the file to Firebase Storage.
6.  It creates a new `transaction` document in Firestore with a `pending` status.
7.  The new transaction now appears in the "Manage Payments" console for an administrator to review.