import { z } from 'zod';

export const adminPaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['bank', 'e-wallet', 'local-transfer', 'international-transfer']),
  name: z.string().min(1),
  displayName: z.string().min(1),
  icon: z.string().optional(),
  isActive: z.boolean(),
  accountHolder: z.string().optional(),
  currencies: z
    .object({
      SAR: z
        .object({
          iban: z.string().optional(),
          accountNumber: z.string().optional(),
          swiftCode: z.string().optional(),
          bankAddress: z.string().optional(),
          swift: z.string().optional(),
        })
        .optional(),
      USD: z
        .object({
          iban: z.string().optional(),
          accountNumber: z.string().optional(),
          swiftCode: z.string().optional(),
          bankAddress: z.string().optional(),
          swift: z.string().optional(),
        })
        .optional(),
      YER: z
        .object({
          iban: z.string().optional(),
          accountNumber: z.string().optional(),
          swiftCode: z.string().optional(),
          bankAddress: z.string().optional(),
          swift: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  wallet: z
    .object({
      provider: z
        .enum([
          'cac-bank',
          'mobi-cash',
          'yemen-mobile',
          'mtn-mobile-money',
          'you-telecom',
          'aljazira-bank',
          'tadhamon-bank',
          'other',
        ])
        .optional(),
      accountNumber: z.string().optional(),
      accountName: z.string().optional(),
      phoneNumber: z.string().optional(),
      notes: z.string().optional(),
      name: z.string().optional(),
      id: z.string().optional(),
      number: z.string().optional(),
    })
    .optional(),
  instructions: z.string().optional(),
  processingTime: z.string().optional(),
});

export type AdminPaymentMethod = z.infer<typeof adminPaymentMethodSchema>;

