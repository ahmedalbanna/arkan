

'use server';

// This API route is now obsolete as the template application logic
// has been moved to the client-side for better performance and simplicity.
// The file is kept to avoid breaking changes if it's referenced, but it will not be used.

import { _createApiResponse, handleApiError } from '@/lib/utils/api-utils';

export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410); // 410 Gone
}
