
import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
import { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";

@injectable()
export class FirebaseSectionRepository implements ISectionRepository {
    private readonly collection = adminDb.collection("sections");

    async getAll(): Promise<SectionDefinition[]> {
        const snapshot = await this.collection.orderBy("title").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SectionDefinition));
    }

    async getById(id: string): Promise<SectionDefinition | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as SectionDefinition;
    }

    async save(section: SectionDefinition): Promise<SectionDefinition> {
        const { id, ...data } = section;
        await this.collection.doc(id).set(data, { merge: true });
        return section;
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }
}
