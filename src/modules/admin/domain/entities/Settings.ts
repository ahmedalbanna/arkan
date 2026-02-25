import { z } from 'zod';

export const bankTransferDetailsSchema = z.object({
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
});

export const walletDetailsSchema = z.object({
  provider: z.enum(['cac-bank', 'mobi-cash', 'yemen-mobile', 'mtn-mobile-money', 'you-telecom', 'aljazira-bank', 'tadhamon-bank', 'other']),
  accountNumber: z.string().min(1, "Account number is required."),
  accountName: z.string().min(1, "Account name is required."),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
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
    SAR: bankTransferDetailsSchema.optional(),
    USD: bankTransferDetailsSchema.optional(),
    YER: bankTransferDetailsSchema.optional(),
  }).optional(),
  wallet: walletDetailsSchema.optional(),
  instructions: z.string().optional(),
  processingTime: z.string().optional(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});

export type AppSettings = z.infer<typeof settingsSchema>;
export type PublicSettings = Partial<AppSettings>;
