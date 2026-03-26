import { z } from 'zod';

export const bankTransferDetailsSchema = z.object({
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
});

export const walletDetailsSchema = z.object({
  provider: z.enum(['cac-bank', 'mobi-cash', 'yemen-mobile', 'mtn-mobile-money', 'you-telecom', 'aljazira-bank', 'tadhamon-bank', 'other']).optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
  // Support legacy seed data format
  name: z.string().optional(),
  id: z.string().optional(),
  number: z.string().optional(),
});

export const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['bank', 'e-wallet', 'local-transfer', 'international-transfer']),
  name: z.string().min(1, "Internal name is required."),
  displayName: z.string().min(1, "Display name is required."),
  icon: z.string().optional(),
  isActive: z.boolean(),
  accountHolder: z.string().optional(),
  currencies: z.object({
    SAR: bankTransferDetailsSchema.extend({ swift: z.string().optional() }).optional(),
    USD: bankTransferDetailsSchema.extend({ swift: z.string().optional() }).optional(),
    YER: bankTransferDetailsSchema.extend({ swift: z.string().optional() }).optional(),
  }).optional(),
  wallet: walletDetailsSchema.optional(),
  instructions: z.string().optional(),
  processingTime: z.string().optional(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

