import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
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

    let featureRef = adminDb.collection('features').doc(id);
    let featureDoc = await featureRef.get();

    if (!featureDoc.exists) {
      return handleApiError({ message: 'Feature not found.' }, 404);
    }

    let body = await request.json();
    let validation = updateFeatureSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await featureRef.update({ isEnabled: validation.data.isEnabled });
    let updatedDoc = await featureRef.get();

    return createApiResponse({id: updatedDoc.id, ...updatedDoc.data()}, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
