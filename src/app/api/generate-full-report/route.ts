// This file is no longer needed and can be deleted.
import { createApiResponse } from '@/lib/api-utils';

export async function POST() {
    return createApiResponse({ message: "This feature has been deprecated." }, 410);
}
