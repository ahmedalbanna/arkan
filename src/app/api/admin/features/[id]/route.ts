import { z } from 'zod';
import { getDoc, updateDoc } from '@/lib/firebase/db-helpers';
import { handleApiError, withAuth, createApiResponse } from '@/lib/utils/api-utils';

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

export const PUT = withAuth(async ({ request, params }) => {
  try {
    let id = params.id;
    if (!id) {
      return handleApiError({ message: 'Feature ID is required.' }, 400);
    }

    let feature = await getDoc('features', id);
    if (!feature) {
      return handleApiError({ message: 'Feature not found.' }, 404);
    }

    let body = await request.json();
    let validation = updateFeatureSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let updated = await updateDoc('features', id, { isEnabled: validation.data.isEnabled });

    return createApiResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
