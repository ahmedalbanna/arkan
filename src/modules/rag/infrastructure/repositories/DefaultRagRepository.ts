
import { injectable } from "tsyringe";
import { IRagRepository, RagIndexingOptions, RagRetrievalOptions, RagIndexingResult, RagRetrievalResult } from "../../domain/repositories/IRagRepository";
import { indexDocument } from "@/modules/rag/infrastructure/indexer";
import { retrieveContext } from "@/modules/rag/infrastructure/retrieval";
import { getVectorStore } from "@/modules/rag/infrastructure/vector-store";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class DefaultRagRepository implements IRagRepository {
    async indexDocument(content: string, options?: RagIndexingOptions): Promise<Result<RagIndexingResult, RagError>> {
        try {
            const result = await indexDocument(content, options as any);
            const formattedResult = {
                success: result.success,
                chunksCreated: result.chunksCreated,
                errors: result.errors
            };

            if (!result.success) {
                return Result.fail(RagError.indexingFailed("Document indexing failed", result.errors));
            }

            return Result.ok(formattedResult);
        } catch (error: any) {
            return Result.fail(RagError.indexingFailed(error.message));
        }
    }

    async retrieveContext(query: string, options?: RagRetrievalOptions): Promise<Result<RagRetrievalResult, RagError>> {
        try {
            const result = await retrieveContext(query, options as any);
            return Result.ok({
                sources: result.sources,
                context: result.context
            });
        } catch (error: any) {
            return Result.fail(RagError.retrievalFailed(error.message));
        }
    }

    async getStats(): Promise<Result<{ totalChunks: number }, RagError>> {
        try {
            const vectorStore = getVectorStore();
            let totalChunks = 0;
            if (typeof vectorStore.size === 'function') {
                totalChunks = await vectorStore.size();
            } else {
                totalChunks = vectorStore.size();
            }
            return Result.ok({
                totalChunks,
            });
        } catch (error: any) {
            return Result.fail(RagError.vectorStoreError(error.message));
        }
    }

    async clear(): Promise<Result<void, RagError>> {
        try {
            const vectorStore = getVectorStore();
            await vectorStore.clear();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(RagError.vectorStoreError(error.message));
        }
    }
}
