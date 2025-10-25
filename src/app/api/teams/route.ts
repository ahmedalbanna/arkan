// This file is obsolete and can be safely deleted.
// The Team Management feature has been removed.
import { handleApiError } from '@/lib/api-utils';

export async function GET() {
    return handleApiError({ message: "This feature has been removed." }, 410);
}

export async function POST() {
    return handleApiError({ message: "This feature has been removed." }, 410);
}
