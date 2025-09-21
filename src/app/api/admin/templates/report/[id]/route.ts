
// src/app/api/templates/report/[id]/route.ts
// This entire API route is no longer needed as report templates have been removed.
// It can be safely deleted.

import { createApiResponse } from '@/lib/api-utils';

export async function PUT() {
    return createApiResponse({ message: "This feature has been deprecated." }, 410);
}

export async function DELETE() {
    return createApiResponse({ message: "This feature has been deprecated." }, 410);
}
