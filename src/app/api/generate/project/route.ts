
// This file is now obsolete and can be safely deleted.
// The project build logic is now handled client-side by orchestrating
// individual section generation calls.
import { handleApiError } from '@/infrastructure/api/api-utils';

export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
