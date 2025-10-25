
// This file is obsolete and can be safely deleted.
// The Presentation Translation feature has been removed from the application.
import { createApiResponse } from '@/lib/api-utils';

export async function POST(request: Request) {
    return createApiResponse({ error: 'This endpoint is deprecated.' }, 410);
}
