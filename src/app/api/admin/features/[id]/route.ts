import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, withAuth, createApiResponse } from '@/lib/utils/api-utils';

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

/**
 * PUT /api/admin/features/[id]
 * Admin-only endpoint to update a feature's enabled status
 */
export const PUT = withAuth(
  async ({ request, params }) => {
    try {
      const { id } = await params;
      
      if (!id) {
        return handleApiError({ message: 'Feature ID is required.' }, 400);
      }

      // Check if feature exists
      const feature = await prisma.feature.findUnique({
        where: { id },
      });

      if (!feature) {
        return handleApiError({ message: 'Feature not found.' }, 404);
      }

      const body = await request.json();
      const validation = updateFeatureSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const updated = await prisma.feature.update({
        where: { id },
        data: { isEnabled: validation.data.isEnabled },
      });

      return createApiResponse(
        {
          id: updated.id,
          key: updated.key,
          name: updated.name,
          description: updated.description,
          isEnabled: updated.isEnabled,
        },
        200
      );
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
