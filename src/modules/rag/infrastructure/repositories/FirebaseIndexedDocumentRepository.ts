
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { Timestamp } from "firebase-admin/firestore";
import { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";

const COLLECTION_NAME = 'indexed_documents';

@injectable()
export class FirebaseIndexedDocumentRepository implements IIndexedDocumentRepository {
    private readonly collection = adminDb.collection(COLLECTION_NAME);

    async record(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status'>): Promise<string> {
        const docRef = this.collection.doc();
        const record: Omit<IndexedDocumentRecord, 'id'> = {
            ...data,
            timestamp: Date.now(),
            indexedAt: Timestamp.now(),
            status: 'indexed',
        };
        await docRef.set(record);
        return docRef.id;
    }

    async recordFailed(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status' | 'chunksCount'>): Promise<string> {
        const docRef = this.collection.doc();
        const record: Omit<IndexedDocumentRecord, 'id'> = {
            ...data,
            chunksCount: 0,
            timestamp: Date.now(),
            indexedAt: Timestamp.now(),
            status: 'failed',
        };
        await docRef.set(record);
        return docRef.id;
    }

    async getAll(limit: number = 50): Promise<IndexedDocumentRecord[]> {
        const snapshot = await this.collection
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord));
    }

    async getByProjectId(projectId: string): Promise<IndexedDocumentRecord[]> {
        const snapshot = await this.collection
            .where('projectId', '==', projectId)
            .where('status', '==', 'indexed')
            .orderBy('timestamp', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord));
    }

    async getByUserId(userId: string): Promise<IndexedDocumentRecord[]> {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('status', '==', 'indexed')
            .orderBy('timestamp', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndexedDocumentRecord));
    }

    async deleteByProjectId(projectId: string): Promise<void> {
        const snapshot = await this.collection
            .where('projectId', '==', projectId)
            .get();
        
        const batch = adminDb.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'deleted', updatedAt: Timestamp.now() });
        });
        await batch.commit();
    }

    async deleteBySourceFile(sourceFile: string): Promise<void> {
        const snapshot = await this.collection
            .where('sourceFile', '==', sourceFile)
            .get();
        
        const batch = adminDb.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'deleted', updatedAt: Timestamp.now() });
        });
        await batch.commit();
    }

    async search(query: string): Promise<IndexedDocumentRecord[]> {
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

        return documents;
    }

    async getStats(): Promise<{
        totalDocuments: number;
        totalChunks: number;
        projectCount: number;
        recentUploads: number;
    }> {
        const snapshot = await this.collection.get();
        const docs = snapshot.docs.map(doc => doc.data() as IndexedDocumentRecord);
        
        const totalDocuments = docs.length;
        const totalChunks = docs.reduce((sum, doc) => sum + (doc.chunksCount || 0), 0);
        const projectCount = new Set(docs.map(doc => doc.projectId)).size;
        
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentUploads = docs.filter(doc => doc.timestamp > twentyFourHoursAgo).length;

        return {
            totalDocuments,
            totalChunks,
            projectCount,
            recentUploads
        };
    }
}
