'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
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

// Payment method schema for new flexible payment system
const bankTransferDetailsSchema = z.object({
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
});

const walletDetailsSchema = z.object({
  provider: z.enum(['cac-bank', 'mobi-cash', 'yemen-mobile', 'mtn-mobile-money', 'you-telecom', 'aljazira-bank', 'tadhamon-bank', 'other']),
  accountNumber: z.string(),
  accountName: z.string(),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['bank', 'e-wallet', 'local-transfer', 'international-transfer']),
  name: z.string(),
  displayName: z.string(),
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
  bankAccounts: z.array(bankAccountSchema).optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});


async function getSettings() {
    let settingsRef = adminDb.collection('settings').doc('defaults');
    let doc = await settingsRef.get();
    if (!doc.exists) {
        // If settings don't exist, return an empty structure.
        // The admin UI should guide the user to seed the database.
        return {
            newUserCredits: 10,
            bankAccounts: []
        };
    }
    return doc.data();
}

// GET /api/settings - This endpoint is public to allow fetching bank details
export async function GET() {
    try {
        let settings = await getSettings();
        return createApiResponse(settings, 200);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT /api/settings - This endpoint remains admin-only
export const PUT = withAuth(async ({ request }) => {
    try {
        let body = await request.json();
        let validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(validation.data, { merge: true });

        return createApiResponse(validation.data, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
