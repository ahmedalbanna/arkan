import "reflect-metadata";

import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
import { IAgentRepository, Agent } from "../../domain/repositories/IAgentRepository";

@injectable()
export class FirebaseAgentRepository implements IAgentRepository {
    private readonly collection = adminDb.collection("agents");

    async getById(id: string): Promise<Agent | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Agent;
    }

    async getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Agent[]> {
        let query: FirebaseFirestore.Query = this.collection;

        if (filters?.category) {
            query = query.where('category', '==', filters.category);
        }
        if (filters?.enabledOnly) {
            query = query.where('isEnabled', '==', true);
        }

        const snapshot = await query.orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
    }

    async save(id: string, data: any): Promise<Agent> {
        const agentRef = this.collection.doc(id);
        const now = new Date().toISOString();
        const dataToSave = {
            ...data,
            updatedAt: now,
        };
        
        const doc = await agentRef.get();
        if (!doc.exists) {
            dataToSave.createdAt = now;
        }
        
        await agentRef.set(dataToSave, { merge: true });
        return { id, ...dataToSave } as Agent;
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }
}
