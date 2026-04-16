import { z } from 'zod';
import { adminPaymentMethodSchema, type AdminPaymentMethod } from '../schemas/PaymentMethodSchema';

export const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  paymentMethods: z.array(adminPaymentMethodSchema).optional(),
});

export interface SettingsProperties {
    newUserCredits: number;
    paymentMethods?: AdminPaymentMethod[];
}

export type AppSettings = z.infer<typeof settingsSchema>;
export type PublicSettings = Partial<AppSettings>;

export class Settings {
    public newUserCredits: number;
    public paymentMethods: AdminPaymentMethod[];

    constructor(props: SettingsProperties) {
        this.newUserCredits = props.newUserCredits;
        this.paymentMethods = props.paymentMethods || [];
    }
}
