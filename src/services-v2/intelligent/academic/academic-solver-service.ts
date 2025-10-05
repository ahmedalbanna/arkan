/**
 * خدمة حل المسائل الأكاديمية - Services v2.0
 *
 * خدمة محسنة لحل المسائل الأكاديمية وتحليل المستندات مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface AcademicDocumentType {
    type: 'exam' | 'homework' | 'quiz' | 'assignment' | 'research' | 'report';
    subject?: string;
    grade?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AnalyzedDocument {
    id: string;
    content: string;
    documentType: AcademicDocumentType;
    analysis: {
        questions: Array<{
            id: string;
            question: string;
            type: string;
            difficulty: string;
            points?: number;
        }>;
        structure: {
            sections: string[];
            totalQuestions: number;
            estimatedTime: number;
        };
    };
    metadata: {
        language: string;
        fileSize: number;
        processingTime: number;
    };
    createdAt: string;
}

export interface SolvedDocument {
    id: string;
    analyzedDocumentId: string;
    solutions: Array<{
        questionId: string;
        answer: string;
        explanation: string;
        confidence: number;
        sources?: string[];
    }>;
    summary: {
        totalQuestions: number;
        solvedQuestions: number;
        accuracy: number;
        processingTime: number;
    };
    metadata: {
        model: string;
        temperature: number;
        tokensUsed: number;
    };
    createdAt: string;
}

export interface AnalyzeVariables {
    markdown: string;
    documentType: AcademicDocumentType;
    token: string;
}

export interface SolveVariables {
    analyzedDocument: AnalyzedDocument;
    contextMarkdown?: string;
    token: string;
}

export class AcademicSolverServiceV2 extends BaseService {
    constructor() {
        super('AcademicSolverServiceV2');
    }

    /**
     * تحليل مستند أكاديمي مع مراقبة الأداء
     */
    async analyze(variables: AnalyzeVariables): Promise<AnalyzedDocument> {
        const operationId = this.startOperation('analyze');

        try {
            const { markdown, documentType, token } = variables;
            const response = await fetch('/api/academic-solver/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ markdown, documentType }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Analysis failed.');
            }

            const analyzedDocument = await response.json();
            this.endOperation(operationId, { success: true });
            return analyzedDocument;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.analyze');
            throw error;
        }
    }

    /**
     * حل مستند أكاديمي مع مراقبة شاملة
     */
    async solve(variables: SolveVariables): Promise<SolvedDocument> {
        const operationId = this.startOperation('solve');

        try {
            const { analyzedDocument, contextMarkdown, token } = variables;
            const response = await fetch('/api/academic-solver/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ analyzedDocument, contextMarkdown }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Solving failed.');
            }

            const solvedDocument = await response.json();
            this.endOperation(operationId, { success: true });
            return solvedDocument;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.solve');
            throw error;
        }
    }

    /**
     * تحليل مستند مع خيارات متقدمة مع مراقبة الأداء
     */
    async analyzeWithOptions(variables: AnalyzeVariables & {
        options?: {
            extractImages?: boolean;
            includeMetadata?: boolean;
            language?: string;
        }
    }): Promise<AnalyzedDocument> {
        const operationId = this.startOperation('analyzeWithOptions');

        try {
            const { markdown, documentType, token, options } = variables;
            const response = await fetch('/api/academic-solver/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ markdown, documentType, options }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Analysis failed.');
            }

            const analyzedDocument = await response.json();
            this.endOperation(operationId, { success: true });
            return analyzedDocument;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.analyzeWithOptions');
            throw error;
        }
    }

    /**
     * حل مستند مع خيارات متقدمة مع مراقبة شاملة
     */
    async solveWithOptions(variables: SolveVariables & {
        options?: {
            model?: string;
            temperature?: number;
            includeExplanations?: boolean;
            maxTokens?: number;
        }
    }): Promise<SolvedDocument> {
        const operationId = this.startOperation('solveWithOptions');

        try {
            const { analyzedDocument, contextMarkdown, token, options } = variables;
            const response = await fetch('/api/academic-solver/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ analyzedDocument, contextMarkdown, options }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Solving failed.');
            }

            const solvedDocument = await response.json();
            this.endOperation(operationId, { success: true });
            return solvedDocument;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.solveWithOptions');
            throw error;
        }
    }

    /**
     * جلب حلول سابقة لمستند مع مراقبة الأداء
     */
    async getDocumentSolutions(documentId: string, token: string): Promise<SolvedDocument[]> {
        const operationId = this.startOperation('getDocumentSolutions');

        try {
            const response = await fetch(`/api/academic-solver/solutions/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch document solutions');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.solutions?.length || 0 });
            return result.solutions || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.getDocumentSolutions');
            throw error;
        }
    }

    /**
     * حفظ حل مستند مع مراقبة شاملة
     */
    async saveSolution(solution: SolvedDocument, token: string): Promise<SolvedDocument> {
        const operationId = this.startOperation('saveSolution');

        try {
            const response = await fetch('/api/academic-solver/solutions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(solution)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save solution');
            }

            const savedSolution = await response.json();
            this.endOperation(operationId, { success: true });
            return savedSolution;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.saveSolution');
            throw error;
        }
    }

    /**
     * تقييم دقة الحل مع مراقبة الأداء
     */
    async evaluateSolution(solutionId: string, feedback: {
        accuracy: number;
        completeness: number;
        clarity: number;
        comments?: string;
    }, token: string): Promise<void> {
        const operationId = this.startOperation('evaluateSolution');

        try {
            const response = await fetch(`/api/academic-solver/solutions/${solutionId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to evaluate solution');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.evaluateSolution');
            throw error;
        }
    }

    /**
     * جلب إحصائيات حل المسائل مع مراقبة متقدمة
     */
    async getSolvingStats(token: string, timeRange: 'day' | 'week' | 'month' = 'week') {
        const operationId = this.startOperation('getSolvingStats');

        try {
            const response = await fetch(`/api/academic-solver/stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch solving stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AcademicSolverServiceV2.getSolvingStats');
            throw error;
        }
    }
}