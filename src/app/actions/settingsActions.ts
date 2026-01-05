'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { requireAdmin } from './_utils/auth';
import type { PublicSettings } from '@/lib/types';

const bankAccountSchema = z.object({
  bankName: z.string().min(1),
  accountHolder: z.string().min(1),
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

export async function getPublicSettingsAction(): Promise<PublicSettings> {
  const ref = adminDb.collection('settings').doc('defaults');
  const doc = await ref.get();
  if (!doc.exists) {
    return { newUserCredits: 10, bankAccounts: [] } as PublicSettings;
  }
  return doc.data() as PublicSettings;
}

export async function updateSettingsAction(data: unknown): Promise<PublicSettings> {
  await requireAdmin();
  const parsed = settingsSchema.parse(data);
  const ref = adminDb.collection('settings').doc('defaults');
  await ref.set(parsed, { merge: true });
  return parsed as PublicSettings;
}
