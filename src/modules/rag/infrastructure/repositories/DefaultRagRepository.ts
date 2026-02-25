
import "reflect-metadata";
import { injectable } from "tsyringe";
import { IRagRepository, RagIndexingOptions, RagRetrievalOptions, RagIndexingResult, RagRetrievalResult } from "../../domain/repositories/IRagRepository";
import { indexDocument } from "@/modules/rag/infrastructure/indexer";
import { retrieveContext } from "@/modules/rag/infrastructure/retrieval";
import { getVectorStore } from "@/modules/rag/infrastructure/vector-store";

@injectable()
export class DefaultRagRepository implements IRagRepository {
    async indexDocument(content: string, options?: RagIndexingOptions): Promise<RagIndexingResult> {
        const result = await indexDocument(content, options as any);
        return {
            success: result.success,
            chunksCreated: result.chunksCreated,
            errors: result.errors
        };
    }

    async retrieveContext(query: string, options?: RagRetrievalOptions): Promise<RagRetrievalResult> {
        const result = await retrieveContext(query, options as any);
        return {
            sources: result.sources,
            context: result.context
        };
    }

    async getStats(): Promise<{ totalChunks: number }> {
        const vectorStore = getVectorStore();
        let totalChunks = 0;
        if (typeof vectorStore.size === 'function') {
            totalChunks = await vectorStore.size();
        } else {
            totalChunks = vectorStore.size();
        }
        return {
            totalChunks,
        };
    }

    async clear(): Promise<void> {
        const vectorStore = getVectorStore();
        vectorStore.clear();
    }
}
