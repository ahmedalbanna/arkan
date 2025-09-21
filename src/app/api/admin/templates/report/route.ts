
// src/app/api/templates/report/route.ts
// This entire API route is no longer needed as report templates have been removed.
// It can be safely deleted.

import { createApiResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
    return createApiResponse({ message: "This feature has been deprecated." }, 410);
}

export async function POST() {
    return createApiResponse({ message: "This feature has been deprecated." }, 410);
}
