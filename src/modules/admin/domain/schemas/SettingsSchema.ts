
import { z } from 'zod';
import { paymentMethodSchema } from '@/modules/billing/domain/schemas';

export const AppSettingsSchema = z.object({
    newUserCredits: z.number().int().min(0),
    paymentMethods: z.array(paymentMethodSchema).optional(),
});

export type AppSettingsInput = z.infer<typeof AppSettingsSchema>;
