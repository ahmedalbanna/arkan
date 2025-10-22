
import type {
    AcademicDocumentType,
    AnalyzedDocument,
    SolvedDocument,
} from '@/ai/schemas';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type AcademicSolverStage = 'idle' | 'analyzing' | 'readyToSolve' | 'solving' | 'complete';

export interface AcademicSolverFile {
    fileName: string;
    content: string;
}

/**
 * Represents the raw data structure for the Academic Solver's state.
 */
export interface AcademicSolverData {
    stage?: AcademicSolverStage;
    documentType?: AcademicDocumentType | null;
    questionDocuments?: AcademicSolverFile[];
    externalContext?: AcademicSolverFile[];
    analyzedDocument?: AnalyzedDocument | null;
    solvedDocument?: SolvedDocument | null;
}

// =============================================================================
// ACADEMIC SOLVER MANAGER CLASS
// =============================================================================

/**
 * Manages all state and logic for the Academic Solver feature.
 */
export class AcademicSolverManager {
    public stage: AcademicSolverStage;
    public documentType: AcademicDocumentType | null;
    public questionDocuments: AcademicSolverFile[];
    public externalContext: AcademicSolverFile[];
    public analyzedDocument: AnalyzedDocument | null;
    public solvedDocument: SolvedDocument | null;

    constructor(data?: AcademicSolverData | null) {
        this.stage = data?.stage || 'idle';
        this.documentType = data?.documentType || null;
        this.questionDocuments = data?.questionDocuments || [];
        this.externalContext = data?.externalContext || [];
        this.analyzedDocument = data?.analyzedDocument || null;
        this.solvedDocument = data?.solvedDocument || null;
    }

    public setStage(stage: AcademicSolverStage): void {
        this.stage = stage;
    }

    public setDocumentType(type: AcademicDocumentType | null): void {
        this.documentType = type;
        if (type !== this.documentType) {
            this.reset();
        }
    }

    public addQuestionDocument(fileName: string, content: string): void {
        this.questionDocuments.push({ fileName, content });
        this.stage = 'idle';
    }

    public removeQuestionDocument(index: number): void {
        if (index >= 0 && index < this.questionDocuments.length) {
            this.questionDocuments.splice(index, 1);
        }
    }

    public addExternalContext(fileName: string, content: string): void {
        this.externalContext.push({ fileName, content });
    }

    public removeExternalContext(index: number): void {
        if (index >= 0 && index < this.externalContext.length) {
            this.externalContext.splice(index, 1);
        }
    }

    public setAnalyzedDocument(document: AnalyzedDocument): void {
        this.analyzedDocument = document;
        this.stage = 'readyToSolve';
    }

    public setSolvedDocument(document: SolvedDocument): void {
        this.solvedDocument = document;
        this.stage = 'complete';
    }

    public reset(): void {
        this.stage = 'idle';
        this.questionDocuments = [];
        this.externalContext = [];
        this.analyzedDocument = null;
        this.solvedDocument = null;
    }
    
    /**
     * Checks if the academic solver has any meaningful content, like documents or results.
     * @returns True if there are any documents or analysis results, false otherwise.
     */
    public hasContent(): boolean {
        return this.questionDocuments.length > 0 ||
               this.externalContext.length > 0 ||
               !!this.analyzedDocument ||
               !!this.solvedDocument;
    }

    /**
     * Serializes the manager's state into a plain data object.
     * @returns A plain object representing the Academic Solver's data.
     */
    public toJSON(): AcademicSolverData {
        return {
            stage: this.stage,
            documentType: this.documentType,
            questionDocuments: this.questionDocuments,
            externalContext: this.externalContext,
            analyzedDocument: this.analyzedDocument,
            solvedDocument: this.solvedDocument,
        };
    }
}
