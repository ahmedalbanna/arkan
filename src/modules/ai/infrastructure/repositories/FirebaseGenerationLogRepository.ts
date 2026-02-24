
import { injectable } from "tsyringe";
import { adminDb } from "@/lib/firebase/server-init";
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
}
