// This file is now obsolete and can be safely deleted.
// The logic has been moved to src/app/actions/templateActions.ts
import { handleApiError } from '@/lib/utils/api-utils';

export async function GET() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
export async function POST() {
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
