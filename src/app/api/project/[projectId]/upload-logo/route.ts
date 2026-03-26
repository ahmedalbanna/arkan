
'use server';

// This API route is now deprecated as logo handling is done client-side with data URIs.
// The file is kept to avoid breaking changes if it's referenced, but it will not be used.

import { handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';

export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
