'use server';

import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

const bankTransferDetailsSchema = z.object({
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
});

const walletDetailsSchema = z.object({
  provider: z.enum(['cac-bank', 'mobi-cash', 'yemen-mobile', 'mtn-mobile-money', 'you-telecom', 'aljazira-bank', 'tadhamon-bank', 'other']),
  accountNumber: z.string().min(1, "Account number is required."),
  accountName: z.string().min(1, "Account name is required."),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['bank', 'e-wallet', 'local-transfer', 'international-transfer']),
  name: z.string().min(1, "Internal name is required."),
  displayName: z.string().min(1, "Display name is required."),
  icon: z.string().optional(),
  isActive: z.boolean(),
  accountHolder: z.string().optional(),
  currencies: z.object({
    SAR: bankTransferDetailsSchema.optional(),
    USD: bankTransferDetailsSchema.optional(),
    YER: bankTransferDetailsSchema.optional(),
  }).optional(),
  wallet: walletDetailsSchema.optional(),
  instructions: z.string().optional(),
  processingTime: z.string().optional(),
});

const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});


// GET /api/settings - This endpoint is public to allow fetching bank details
export async function GET() {
    try {
        const controller = container.resolve(AdminController);
        const settings = await controller.getSettings();
        return createApiResponse(settings, 200);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/settings - This endpoint remains admin-only
export const PUT = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(AdminController);
        const updated = await controller.updateSettings(validation.data);

        return createApiResponse(updated, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
