
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { Agent, AgentProperties } from "../../domain/entities/Agent";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class FirebaseAgentRepository implements IAgentRepository {
    private readonly collection = adminDb.collection("agents");

    async getById(id: string): Promise<Result<Agent, AiError>> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return Result.fail(AiError.notFound(`Agent with id ${id} not found`));
            }
            return Result.ok(new Agent({ id: doc.id, ...doc.data() } as AgentProperties));
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Result<Agent[], AiError>> {
        try {
            let query: FirebaseFirestore.Query = this.collection;

            if (filters?.category) {
                query = query.where('category', '==', filters.category);
            }
            if (filters?.enabledOnly) {
                query = query.where('isEnabled', '==', true);
            }

            const snapshot = await query.orderBy('name').get();
            const agents = snapshot.docs.map(doc => new Agent({ id: doc.id, ...doc.data() } as AgentProperties));
            return Result.ok(agents);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async save(id: string, data: any): Promise<Result<Agent, AiError>> {
        try {
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
            return Result.ok(new Agent({ id, ...dataToSave } as AgentProperties));
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, AiError>> {
        try {
            await this.collection.doc(id).delete();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getCategories(): Promise<Result<any[], AiError>> {
        try {
            const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
            const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return Result.ok(categories);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }
}
