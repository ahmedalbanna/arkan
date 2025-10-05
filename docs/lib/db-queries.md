
This document outlines the purpose and functions within `src/lib/db/queries.ts`, which is the sole access point for all Firestore database operations.

## 1. Purpose

-   This file centralizes all logic for reading from and writing to the Firestore database. It abstracts away the raw `firebase-admin` calls, providing a clean, reusable, and type-safe API for the rest of the application (primarily for the server-side API routes).
-   By keeping all queries here, we ensure that data access patterns are consistent and easy to manage.

## 2. Key Concepts

-   **Server-Side Only**: This module is marked with `'use server'` and is designed to be used exclusively on the server, within Next.js API Routes.
-   **Type-Safety**: It defines and uses TypeScript interfaces for all major data models (`UserProfile`, `Team`, `TransactionData`, etc.), ensuring that data returned from and sent to Firestore is well-structured.
-   **Single Responsibility**: Each function has a single, clear purpose, such as fetching a user profile, updating user credits, or creating a new team.

## 3. Key Functions

-   **`getUserProfile(id)`**: Fetches a user's document from the `users` collection by their ID.
-   **`updateUserCredits(userId, credits)`**: Atomically increments a user's credit balance. This is a critical function for any feature that consumes credits.
-   **`getPaginatedUsers({ page, limit })`**: Fetches a paginated list of users, designed for the admin user management console.
-   **`getPendingTransactions(limit, lastVisibleId)`**: Fetches a paginated list of payment transactions with a `pending` status, used in the admin payment verification console.
-   **Team Management Functions (`getUserTeams`, `createTeamForUser`)**: Handle all the logic for fetching and creating team data, including managing relationships between the `teams` and `users` collections.
-   **`getAgent(agentId)`**: Retrieves a single agent's configuration from Firestore, falling back to the static config in `agents.ts` if it doesn't exist.

This file is the data persistence backbone of the application, providing a secure and organized way to interact with Firestore.
