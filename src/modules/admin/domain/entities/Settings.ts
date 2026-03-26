import { z } from 'zod';
import { paymentMethodSchema, type PaymentMethod } from '@/modules/billing/domain/entities/PaymentMethod';

export const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});

export interface SettingsProperties {
    newUserCredits: number;
    paymentMethods?: PaymentMethod[];
}

export type AppSettings = z.infer<typeof settingsSchema>;
export type PublicSettings = Partial<AppSettings>;

export class Settings {
    public newUserCredits: number;
    public paymentMethods: PaymentMethod[];

    constructor(props: SettingsProperties) {
        this.newUserCredits = props.newUserCredits;
        this.paymentMethods = props.paymentMethods || [];
    }
}
