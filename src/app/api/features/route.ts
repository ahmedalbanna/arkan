// src/app/api/features/route.ts
import { prisma } from '@/lib/db/prisma';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';

/**
 * GET /api/features
 * This is a public endpoint that returns all enabled features
 */
export async function GET() {
  try {
    let features = await prisma.feature.findMany();

    // Lazy seeding: If no features exist, populate from default config.
    if (features.length === 0) {
      for (const feature of defaultFeatures) {
        await prisma.feature.create({
          data: {
            key: feature.key,
            name: feature.name,
            description: feature.description,
            isEnabled: feature.isEnabled,
          },
        });
      }

      // Re-fetch after seeding
      features = await prisma.feature.findMany();
    }

    const response = features.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      description: f.description,
      isEnabled: f.isEnabled,
      createdAt: f.createdAt.toISOString(),
    }));

    return createApiResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

/**
 * PUT /api/features/:id
 * Admin-only endpoint to update a feature's status
 */
export const PUT = withAuth(
  async ({ request, params }) => {
    try {
      const body = await request.json();
      const validation = updateFeatureSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { isEnabled } = validation.data;
      const { id } = await params;

      const updated = await prisma.feature.update({
        where: { id },
        data: { isEnabled },
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
