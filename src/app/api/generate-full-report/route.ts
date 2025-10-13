// This file is no longer needed and can be deleted.
import { createApiResponseEnhanced } from '@/core/api';

export async function POST() {
    return createApiResponseEnhanced({ message: "This feature has been deprecated." }, 410);
}
