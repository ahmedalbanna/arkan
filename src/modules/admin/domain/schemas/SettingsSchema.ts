
import { z } from 'zod';
import { adminPaymentMethodSchema } from './PaymentMethodSchema';

export const AppSettingsSchema = z.object({
    newUserCredits: z.number().int().min(0),
    paymentMethods: z.array(adminPaymentMethodSchema).optional(),
});

export type AppSettingsInput = z.infer<typeof AppSettingsSchema>;
