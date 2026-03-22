
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { Timestamp } from "firebase-admin/firestore";
import { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

const COLLECTION_NAME = 'indexed_documents';

@injectable()
export class FirebaseIndexedDocumentRepository implements IIndexedDocumentRepository {
    private readonly collection = adminDb.collection(COLLECTION_NAME);

    async record(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status'>): Promise<Result<string, RagError>> {
        try {
            const docRef = this.collection.doc();
            const record: Omit<IndexedDocumentRecord, 'id'> = {
                ...data,
                timestamp: Date.now(),
                indexedAt: Timestamp.now(),
                status: 'indexed',
            };
            await docRef.set(record);
            return Result.ok(docRef.id);
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async recordFailed(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status' | 'chunksCount'>): Promise<Result<string, RagError>> {
        try {
            const docRef = this.collection.doc();
            const record: Omit<IndexedDocumentRecord, 'id'> = {
                ...data,
                chunksCount: 0,
                timestamp: Date.now(),
                indexedAt: Timestamp.now(),
                status: 'failed',
            };
            await docRef.set(record);
            return Result.ok(docRef.id);
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async getAll(limit: number = 50): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const snapshot = await this.collection
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord)));
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async getByProjectId(projectId: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const snapshot = await this.collection
                .where('projectId', '==', projectId)
                .where('status', '==', 'indexed')
                .orderBy('timestamp', 'desc')
                .get();
            
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord)));
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const snapshot = await this.collection
                .where('userId', '==', userId)
                .where('status', '==', 'indexed')
                .orderBy('timestamp', 'desc')
                .get();
            
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord)));
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async deleteByProjectId(projectId: string): Promise<Result<void, RagError>> {
        try {
            const snapshot = await this.collection
                .where('projectId', '==', projectId)
                .get();
            
            const batch = adminDb.batch();
            snapshot.forEach(doc => {
                batch.update(doc.ref, { status: 'deleted', updatedAt: Timestamp.now() });
            });
            await batch.commit();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async deleteBySourceFile(sourceFile: string): Promise<Result<void, RagError>> {
        try {
            const snapshot = await this.collection
                .where('sourceFile', '==', sourceFile)
                .get();
            
            const batch = adminDb.batch();
            snapshot.forEach(doc => {
                batch.update(doc.ref, { status: 'deleted', updatedAt: Timestamp.now() });
            });
            await batch.commit();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async search(query: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const snapshot = await this.collection
                .where('status', '==', 'indexed')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            const documents: IndexedDocumentRecord[] = [];
            const lowerQuery = query.toLowerCase();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const sourceFile = (data.sourceFile || '').toLowerCase();
                const projectId = (data.projectId || '').toLowerCase();
                
                if (sourceFile.includes(lowerQuery) || projectId.includes(lowerQuery)) {
                    documents.push({ id: doc.id, ...data } as IndexedDocumentRecord);
                }
            });

            return Result.ok(documents);
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }

    async getStats(): Promise<Result<{
        totalDocuments: number;
        totalChunks: number;
        projectCount: number;
        recentUploads: number;
    }, RagError>> {
        try {
            const snapshot = await this.collection.get();
            const docs = snapshot.docs.map(doc => doc.data() as IndexedDocumentRecord);
            
            const totalDocuments = docs.length;
            const totalChunks = docs.reduce((sum, doc) => sum + (doc.chunksCount || 0), 0);
            const projectCount = new Set(docs.map(doc => doc.projectId)).size;
            
            const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
            const recentUploads = docs.filter(doc => doc.timestamp > twentyFourHoursAgo).length;

            return Result.ok({
                totalDocuments,
                totalChunks,
                projectCount,
                recentUploads
            });
        } catch (error: any) {
            return Result.fail(RagError.databaseError(error.message));
        }
    }
}
