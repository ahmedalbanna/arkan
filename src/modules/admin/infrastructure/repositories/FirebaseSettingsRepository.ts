import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";
import { defaultPaymentMethods } from "@/lib/db/seed-data/payment-methods";

@injectable()
export class FirebaseSettingsRepository implements ISettingsRepository {
    private readonly collection = adminDb.collection('settings');
    private readonly docRef = this.collection.doc('defaults');

    async get(): Promise<AppSettings> {
        const doc = await this.docRef.get();
        if (!doc.exists || !doc.data()?.paymentMethods) {
            const defaultSettings = {
                newUserCredits: 10,
                paymentMethods: defaultPaymentMethods,
            };
            await this.docRef.set(defaultSettings, { merge: true });
            return defaultSettings as AppSettings;
        }
        return doc.data() as AppSettings;
    }

    async update(data: AppSettings): Promise<AppSettings> {
        await this.docRef.set(data, { merge: true });
        return data;
    }
}
