// This file is now obsolete and can be safely deleted.
// The logic has been moved to the client-side.
import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';

export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410); // 410 Gone
}
