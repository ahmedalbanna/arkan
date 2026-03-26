// This file is now obsolete and can be safely deleted.
// The logic has been moved to the more specific `/api/writing-tools/generate-chapter/route.ts` endpoint.
import { handleApiError } from '@/infrastructure/api/api-utils';

export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
