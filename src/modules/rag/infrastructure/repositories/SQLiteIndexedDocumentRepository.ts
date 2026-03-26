import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { indexedDocuments } from "@/infrastructure/db/schema";
import { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";
import { eq, desc, count, sql, like, or, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteIndexedDocumentRepository implements IIndexedDocumentRepository {
    async record(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status'>): Promise<Result<string, RagError>> {
        try {
            const id = uuidv4();
            const now = Date.now();
            const indexedAt = new Date().toISOString();
            
            await db.insert(indexedDocuments).values({
                ...data,
                id,
                timestamp: now,
                indexedAt,
                status: 'indexed',
            } as any);
            
            return Result.ok(id);
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async recordFailed(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status' | 'chunksCount'>): Promise<Result<string, RagError>> {
        try {
            const id = uuidv4();
            const now = Date.now();
            const indexedAt = new Date().toISOString();
            
            await db.insert(indexedDocuments).values({
                ...data,
                id,
                timestamp: now,
                indexedAt,
                chunksCount: 0,
                status: 'failed',
            } as any);
            
            return Result.ok(id);
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async getAll(limit: number = 50): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const results = await db.query.indexedDocuments.findMany({
                orderBy: [desc(indexedDocuments.indexedAt)],
                limit,
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async getByProjectId(projectId: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const results = await db.query.indexedDocuments.findMany({
                where: eq(indexedDocuments.projectId, projectId),
                orderBy: [desc(indexedDocuments.indexedAt)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const results = await db.query.indexedDocuments.findMany({
                where: eq(indexedDocuments.userId, userId),
                orderBy: [desc(indexedDocuments.indexedAt)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async deleteByProjectId(projectId: string): Promise<Result<void, RagError>> {
        try {
            await db.update(indexedDocuments)
                .set({ status: 'deleted' })
                .where(eq(indexedDocuments.projectId, projectId));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async deleteBySourceFile(sourceFile: string): Promise<Result<void, RagError>> {
        try {
            await db.update(indexedDocuments)
                .set({ status: 'deleted' })
                .where(eq(indexedDocuments.sourceFile, sourceFile));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async search(query: string): Promise<Result<IndexedDocumentRecord[], RagError>> {
        try {
            const results = await db.query.indexedDocuments.findMany({
                where: or(
                    like(indexedDocuments.sourceFile, `%${query}%`),
                    like(indexedDocuments.errorMessage, `%${query}%`)
                ),
                orderBy: [desc(indexedDocuments.indexedAt)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    async getStats(): Promise<Result<{
        totalDocuments: number;
        totalChunks: number;
        projectCount: number;
        recentUploads: number;
    }, RagError>> {
        try {
            const [totalDocs] = await db.select({ value: count() }).from(indexedDocuments).where(eq(indexedDocuments.status, 'indexed'));
            const [totalChunks] = await db.select({ value: sql`SUM(${indexedDocuments.chunksCount})` }).from(indexedDocuments).where(eq(indexedDocuments.status, 'indexed'));
            const [projectCount] = await db.select({ value: sql`COUNT(DISTINCT ${indexedDocuments.projectId})` }).from(indexedDocuments).where(eq(indexedDocuments.status, 'indexed'));
            
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const [recentUploads] = await db.select({ value: count() }).from(indexedDocuments).where(and(eq(indexedDocuments.status, 'indexed'), gte(indexedDocuments.timestamp, oneDayAgo)));

            return Result.ok({
                totalDocuments: Number(totalDocs.value),
                totalChunks: Number(totalChunks.value || 0),
                projectCount: Number(projectCount.value || 0),
                recentUploads: Number(recentUploads.value),
            });
        } catch (error: any) {
            return Result.fail(RagError.internal(error.message));
        }
    }

    private toDomain(result: any): IndexedDocumentRecord {
        return {
            ...result,
            indexedAt: result.indexedAt, // Drizzle returns strings/dates, Repository interface expected Timestamp (from firebase-admin)
        } as any;
    }
}

// Internal helper for gte since it's not imported above
function gte(column: any, value: any) {
    return sql`${column} >= ${value}`;
}
