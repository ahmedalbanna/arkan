
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IGenerationLogRepository, GenerationLog } from "../../domain/repositories/IGenerationLogRepository";

@injectable()
export class FirebaseGenerationLogRepository implements IGenerationLogRepository {
    private readonly collection = adminDb.collection("agent_generations");

    async log(entry: GenerationLog): Promise<void> {
        try {
            const dataToSave = {
                ...entry,
                createdAt: new Date().toISOString(),
            };
            await this.collection.add(dataToSave);
        } catch (error) {
            console.error(`Failed to log generation for agent ${entry.agentId}:`, error);
        }
    }

    async getByUserId(userId: string): Promise<GenerationLog[]> {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    }

    async getPaginated(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<{ logs: any[], hasNextPage: boolean, lastVisibleId: string | null }> {
        let query: FirebaseFirestore.Query = this.collection;

        if (options.agentId) query = query.where('agentId', '==', options.agentId);
        if (options.userId) query = query.where('userId', '==', options.userId);

        query = query.orderBy('createdAt', 'desc');

        if (options.lastVisibleId) {
            const lastDoc = await this.collection.doc(options.lastVisibleId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.limit(options.limit + 1).get();
        const logs = snapshot.docs.slice(0, options.limit).map(doc => ({ id: doc.id, ...doc.data() }));
        const hasNextPage = snapshot.docs.length > options.limit;
        const lastVisibleId = hasNextPage && logs.length > 0 ? (logs[logs.length - 1] as any).id : null;

        return { logs, hasNextPage, lastVisibleId };
    }
}
