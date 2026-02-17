
import { prisma } from '@/lib/db/prisma';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';

async function getSettings() {
  const settings = await prisma.setting.findMany();
  
  if (settings.length === 0) {
    // If settings don't exist, create them with default values
    const defaultSettings = [
      { key: 'newUserCredits', value: '10', type: 'number', description: 'Credits given to new users', isPublic: true },
      { key: 'bankName', value: 'Arkan National Bank', type: 'string', description: 'Bank name for transfers', isPublic: true },
      { key: 'accountHolder', value: 'Arkan Professional Platform', type: 'string', description: 'Account holder name', isPublic: true },
      { key: 'iban', value: 'SA03 8000 0000 6080 1016 7519', type: 'string', description: 'IBAN for transfers', isPublic: true },
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.create({
        data: setting,
      });
    }

    return Object.fromEntries(
      defaultSettings.map((s) => [s.key, s.value])
    );
  }

  return Object.fromEntries(
    settings
      .filter((s) => s.isPublic)
      .map((s) => [s.key, s.value])
  );
}

/**
 * GET /api/settings
 * This endpoint is public for fetching bank details etc.
 */
export async function GET() {
  try {
    const settings = await getSettings();
    return createApiResponse(settings, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

const updateSettingsSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean']),
  description: z.string().optional(),
});

/**
 * PUT /api/settings
 * Admin-only endpoint to update settings
 */
export const PUT = withAuth(
  async ({ request }) => {
    try {
      const body = await request.json();
      const validation = updateSettingsSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { key, value, type, description } = validation.data;

      const updated = await prisma.setting.upsert({
        where: { key },
        update: {
          value,
          type,
          description,
        },
        create: {
          key,
          value,
          type,
          description,
          isPublic: false,
        },
      });

      return createApiResponse(
        {
          key: updated.key,
          value: updated.value,
          type: updated.type,
          description: updated.description,
        },
        200
      );
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
