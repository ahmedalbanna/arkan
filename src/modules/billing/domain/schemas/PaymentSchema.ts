
import { z } from 'zod';

// Shared file upload schema
export const fileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size < 10 * 1024 * 1024, 'File size must be less than 10MB'),
});

// Bank transfer details schema
export const bankTransferDetailsSchema = z.object({
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  bankAddress: z.string().optional(),
});

// E-wallet provider details schema
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

// Main payment method schema
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

export type PaymentMethodType = z.infer<typeof paymentMethodSchema>;

// Bank account schema
export const BankAccountSchema = z.object({
    bankName: z.string(),
    accountHolder: z.string(),
    currencies: z.record(z.string(), z.object({
        iban: z.string(),
        swift: z.string().optional()
    }))
});

export type BankAccountType = z.infer<typeof BankAccountSchema>;
