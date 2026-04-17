import type {
    RagIndexingOptions,
    RagIndexingResult,
    RagRetrievalOptions,
    RagRetrievalResult,
} from "../../domain/repositories/IRagRepository";
import type { IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { RagError } from "../../domain/errors/RagErrors";
import type { RecordFailedIndexingInput } from "../use-cases/IndexDocumentUseCase";

export type RagControllerIndexingOptions = RagIndexingOptions;
export type RagControllerIndexingResult = RagIndexingResult;
export type RagControllerRetrievalOptions = RagRetrievalOptions;
export type RagControllerRetrievalResult = RagRetrievalResult;
export type RagControllerIndexedDocumentRecord = IndexedDocumentRecord;
export type RagControllerRecordFailedIndexingInput = RecordFailedIndexingInput;
export { RagError };
