// This file is obsolete and can be safely deleted.
// The logic has been consolidated into /api/writing-tools/[tool]/route.ts
export async function POST() {
    const { handleApiError } = await import('@/lib/utils/api-utils');
    return handleApiError({ message: 'This endpoint is deprecated.' }, 410);
}
