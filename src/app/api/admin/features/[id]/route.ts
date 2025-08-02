
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { handleApiError, withAuth, createApiResponse } from '@/lib/api-utils';

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

export const PUT = withAuth(async ({ request, params }) => {
  try {
    const id = params.id;
    if (!id) {
      return handleApiError({ message: 'Feature ID is required.' }, 400);
    }

    const featureRef = adminDb.collection('features').doc(id);
    const featureDoc = await featureRef.get();

    if (!featureDoc.exists) {
      return handleApiError({ message: 'Feature not found.' }, 404);
    }

    const body = await request.json();
    const validation = updateFeatureSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await featureRef.update({ isEnabled: validation.data.isEnabled });
    const updatedDoc = await featureRef.get();

    return createApiResponse(updatedDoc.data(), 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
