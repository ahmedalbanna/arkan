This document describes the API endpoints for managing the various templates used in the application.

## Overview

The application uses a hierarchical structure in Firestore to store templates:
-   A top-level `templates` collection.
-   Documents within this collection represent the *type* of template (e.g., `proposal`, `report`, `docx`, `pptx`).
-   Each of these documents has a subcollection (`items` or `styles`) that contains the actual template configurations.

## Endpoints

### GET `/api/templates/{type}`

-   **Examples**: `/api/templates/proposal`, `/api/templates/report`, `/api/templates/docx`, `/api/templates/pptx`
-   **Purpose**: Fetches a list of all available templates for a given type.
-   **Access**: These endpoints are public, as all users need access to the templates to use the generation and export features.
-   **Seeding**: If a template collection is empty when requested, the endpoint will automatically seed it with the default configurations defined in the corresponding files in `src/lib`.

### PUT `/api/templates/{type}/[id]`

-   **Examples**: `/api/templates/proposal/default-software`, `/api/templates/docx/modern`
-   **Purpose**: Updates a specific template configuration.
-   **Access**: These are protected endpoints that can only be accessed by users with an 'admin' role.
-   **Payload**: Accepts a JSON body containing the fields to be updated for the specific template. The payload is validated against a Zod schema.
-   **Usage**: These endpoints are called by the various mutation hooks in `use-templates.ts`, `use-docx-styles.ts`, and `use-pptx-styles.ts` when an admin saves changes in the management UIs.

### POST `/api/templates/refresh-image`

-   **Purpose**: A special endpoint used to generate a new preview image for a DOCX or PPTX template using an AI model.
-   **Access**: Admin-only.
-   **Logic**:
    1.  Receives the template type, ID, and a text prompt.
    2.  Calls the `generateImage` AI flow.
    3.  Uploads the resulting image to Firebase Storage.
    4.  Updates the `imageUrl` field in the corresponding template document in Firestore with the new public URL.
-   **Usage**: Called by the `useRefreshTemplateImage` hooks when an admin clicks the refresh button on a template card.