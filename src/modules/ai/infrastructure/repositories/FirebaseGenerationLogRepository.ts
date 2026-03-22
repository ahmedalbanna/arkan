
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IGenerationLogRepository, GenerationLog } from "../../domain/repositories/IGenerationLogRepository";

import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class FirebaseGenerationLogRepository implements IGenerationLogRepository {
    private readonly collection = adminDb.collection("agent_generations");

    async log(entry: GenerationLog): Promise<Result<void, AiError>> {
        try {
            const dataToSave = {
                ...entry,
                createdAt: new Date().toISOString(),
            };
            await this.collection.add(dataToSave);
            return Result.ok();
        } catch (error: any) {
            console.error(`Failed to log generation for agent ${entry.agentId}:`, error);
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<GenerationLog[], AiError>> {
        try {
            const snapshot = await this.collection
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            return Result.ok(logs);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getPaginated(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<Result<{ logs: any[], hasNextPage: boolean, lastVisibleId: string | null }, AiError>> {
        try {
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

            return Result.ok({ logs, hasNextPage, lastVisibleId });
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }
}
