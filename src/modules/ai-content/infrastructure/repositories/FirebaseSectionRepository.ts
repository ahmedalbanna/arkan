
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { Result } from "@/lib/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

@injectable()
export class FirebaseSectionRepository implements ISectionRepository {
    private readonly collection = adminDb.collection("sections");

    async getAll(): Promise<Result<SectionDefinition[], AIContentError>> {
        try {
            const snapshot = await this.collection.orderBy("title").get();
            const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SectionDefinition));
            return Result.ok(sections);
        } catch (error: any) {
            return Result.fail(AIContentError.internal(error.message));
        }
    }

    async getById(id: string): Promise<Result<SectionDefinition, AIContentError>> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return Result.fail(AIContentError.notFound(`Section ${id} not found`));
            }
            return Result.ok({ id: doc.id, ...doc.data() } as SectionDefinition);
        } catch (error: any) {
            return Result.fail(AIContentError.internal(error.message));
        }
    }

    async save(section: SectionDefinition): Promise<Result<SectionDefinition, AIContentError>> {
        try {
            const { id, ...data } = section;
            await this.collection.doc(id).set(data, { merge: true });
            return Result.ok(section);
        } catch (error: any) {
            return Result.fail(AIContentError.saveError(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, AIContentError>> {
        try {
            await this.collection.doc(id).delete();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(AIContentError.deleteError(error.message));
        }
    }
}
