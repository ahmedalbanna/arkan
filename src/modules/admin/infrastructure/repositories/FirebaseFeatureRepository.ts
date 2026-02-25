
import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
import { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";
import { defaultFeatures } from '@/lib/db/seed-data/features';

@injectable()
export class FirebaseFeatureRepository implements IFeatureRepository {
    private readonly collection = adminDb.collection("features");

    async getAll(): Promise<Feature[]> {
        let snapshot = await this.collection.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultFeatures.forEach(feature => {
                const docRef = this.collection.doc(feature.id);
                batch.set(docRef, feature);
            });
            await batch.commit();
            snapshot = await this.collection.get();
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feature));
    }

    async getById(id: string): Promise<Feature | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Feature;
    }

    async update(id: string, data: Partial<Feature>): Promise<Feature> {
        const ref = this.collection.doc(id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...data,
            updatedAt: now
        };
        await ref.update(dataToUpdate);
        const updated = await ref.get();
        return { id: updated.id, ...updated.data() } as Feature;
    }
}
