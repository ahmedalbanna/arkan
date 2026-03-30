
import { z } from 'zod';

export const TransactionPropertiesSchema = z.object({
  id: z.string(), // Transaction/Firestore ID
  userId: z.string(),
  planId: z.string(),
  planName: z.string(),
  credits: z.number().int().positive(),
  price: z.number().nonnegative(),
  userName: z.string(),
  userEmail: z.string().email(),
  status: z.enum(['pending', 'verified', 'rejected']),
  proofUrl: z.string(),
  createdAt: z.string().datetime('Invalid date format'),
  adminNotes: z.string().optional(),
  verifiedAt: z.string().datetime('Invalid date format').optional(),
  verifiedBy: z.string().optional(),
});

export type TransactionPropertiesType = z.infer<typeof TransactionPropertiesSchema>;

export const CreateTransactionSchema = TransactionPropertiesSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    verifiedAt: true,
    verifiedBy: true
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
