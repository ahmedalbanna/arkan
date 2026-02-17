'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required.'),
  accountHolder: z.string().min(1, 'Account holder name is required.'),
  currencies: z.object({
    YER: z.object({ iban: z.string().optional() }).optional(),
    SAR: z.object({ iban: z.string().optional() }).optional(),
    USD: z.object({ iban: z.string().optional() }).optional(),
  }),
});

const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  bankAccounts: z.array(bankAccountSchema).optional(),
});

async function getSettings() {
  const settings = await prisma.setting.findMany();
  
  if (settings.length === 0) {
    return {
      newUserCredits: 10,
      bankAccounts: [],
    };
  }

  const result: any = {};
  settings.forEach((s) => {
    if (s.key === 'bankAccounts') {
      result[s.key] = JSON.parse(s.value);
    } else if (s.key === 'newUserCredits') {
      result[s.key] = parseInt(s.value);
    } else {
      result[s.key] = s.value;
    }
  });

  return result;
}

/**
 * GET /api/admin/settings
 * Fetch all system settings
 */
export async function GET() {
  try {
    const settings = await getSettings();
    return createApiResponse(settings, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/settings
 * Admin-only endpoint to update system settings
 */
export const PUT = withAuth(
  async ({ request }) => {
    try {
      const body = await request.json();
      const validation = settingsSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { newUserCredits, bankAccounts } = validation.data;

      // Update or create newUserCredits setting
      await prisma.setting.upsert({
        where: { key: 'newUserCredits' },
        update: { value: newUserCredits.toString() },
        create: {
          key: 'newUserCredits',
          value: newUserCredits.toString(),
          type: 'number',
          description: 'Credits given to new users',
          isPublic: false,
        },
      });

      // Update or create bankAccounts setting
      if (bankAccounts) {
        await prisma.setting.upsert({
          where: { key: 'bankAccounts' },
          update: { value: JSON.stringify(bankAccounts) },
          create: {
            key: 'bankAccounts',
            value: JSON.stringify(bankAccounts),
            type: 'string',
            description: 'Bank account information for transfers',
            isPublic: false,
          },
        });
      }

      const updatedSettings = await getSettings();
      return createApiResponse(updatedSettings, 200);
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
