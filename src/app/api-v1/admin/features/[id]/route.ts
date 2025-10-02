
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

export const PUT = withEnhancedAuth(async ({ request, params }) => {
  try {
    const id = params.id;
    if (!id) {
      return handleApiErrorEnhanced({ message: 'Feature ID is required.' }, '400');
    }

    const featureRef = adminDb.collection('features').doc(id);
    const featureDoc = await featureRef.get();

    if (!featureDoc.exists) {
      return handleApiErrorEnhanced({ message: 'Feature not found.' }, '404');
    }

    const body = await request.json();
    const validation = updateFeatureSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    await featureRef.update({ isEnabled: validation.data.isEnabled });
    const updatedDoc = await featureRef.get();

    return createApiResponseEnhanced({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
