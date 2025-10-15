/**
 * خدمة أدوات الكتابة - Services v2.0
 *
 * خدمة محسنة لأدوات الكتابة والتحسين مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export type ParaphraseMode = 'formal' | 'casual' | 'academic' | 'business' | 'creative';
export type SummarizeLength = 'short' | 'medium' | 'long' | 'detailed';
export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard';

// أنواع البيانات للخدمة
export interface ParaphraseTextVariables {
    text: string;
    mode: ParaphraseMode;
}

export interface SummarizeTextVariables {
    text: string;
    length: SummarizeLength;
}

export interface GenerateQuizVariables {
    text: string;
    numQuestions: number;
    questionType: 'multiple-choice' | 'true-false' | 'direct-question';
}

export interface HumanizeTextVariables {
    text: string;
}

export interface DetectAIVariables {
    text: string;
}

export interface GrammarCheckVariables {
    text: string;
}

export interface GenerateCitationVariables {
    sourceText: string;
    style: CitationStyle;
}

export interface FactCheckVariables {
    text: string;
}

export interface PlagiarismCheckVariables {
    text: string;
}

export interface AIResearcherVariables {
    topic: string;
}

export interface TopicExplainerVariables {
    topic: string;
}

export interface RewriteTextVariables {
    text: string;
    style: string;
    tone?: string;
    length?: 'shorter' | 'longer' | 'same';
}

export interface TranslateTextVariables {
    text: string;
    fromLanguage: string;
    toLanguage: string;
}

export interface ExpandTextVariables {
    text: string;
    targetLength: number;
}

export interface ShortenTextVariables {
    text: string;
    targetLength: number;
}

export class WritingToolsServiceV2 extends BaseService {
    constructor() {
        super('WritingToolsServiceV2');
    }

    /**
     * إعادة صياغة النص مع مراقبة الأداء
     */
    async paraphraseText(variables: ParaphraseTextVariables, token?: string): Promise<{
        originalText: string;
        paraphrasedText: string;
        changes: string[];
        mode: ParaphraseMode;
    }> {
        const operationId = this.startOperation('paraphraseText');

        try {
            const response = await fetch('/api/writing-tools/paraphrase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to paraphrase text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, mode: variables.mode });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.paraphraseText');
            throw error;
        }
    }

    /**
     * تلخيص النص مع مراقبة شاملة
     */
    async summarizeText(variables: SummarizeTextVariables, token?: string): Promise<{
        originalText: string;
        summary: string;
        wordReduction: number;
        keyPoints: string[];
    }> {
        const operationId = this.startOperation('summarizeText');

        try {
            const response = await fetch('/api/writing-tools/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to summarize text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, length: variables.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.summarizeText');
            throw error;
        }
    }

    /**
     * توليد اختبار من نص مع مراقبة الأداء
     */
    async generateQuiz(variables: GenerateQuizVariables, token?: string): Promise<{
        questions: Array<{
            question: string;
            options?: string[];
            correctAnswer: string;
            explanation?: string;
        }>;
        quizTitle: string;
        difficulty: 'easy' | 'medium' | 'hard';
    }> {
        const operationId = this.startOperation('generateQuiz');

        try {
            const response = await fetch('/api/writing-tools/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate quiz');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, questionCount: result.questions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.generateQuiz');
            throw error;
        }
    }

    /**
     * جعل النص أكثر طبيعية مع مراقبة شاملة
     */
    async humanizeText(variables: HumanizeTextVariables, token?: string): Promise<{
        originalText: string;
        humanizedText: string;
        improvements: string[];
        readabilityScore: number;
    }> {
        const operationId = this.startOperation('humanizeText');

        try {
            const response = await fetch('/api/writing-tools/humanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to humanize text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, readabilityScore: result.readabilityScore });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.humanizeText');
            throw error;
        }
    }

    /**
     * اكتشاف النص المكتوب بالذكاء الاصطناعي مع مراقبة الأداء
     */
    async detectAI(variables: DetectAIVariables, token?: string): Promise<{
        isAI: boolean;
        confidence: number;
        indicators: string[];
        suggestions: string[];
    }> {
        const operationId = this.startOperation('detectAI');

        try {
            const response = await fetch('/api/writing-tools/detect-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to detect AI content');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, confidence: result.confidence });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.detectAI');
            throw error;
        }
    }

    /**
     * فحص النحو والإملاء مع مراقبة شاملة
     */
    async grammarCheck(variables: GrammarCheckVariables, token?: string): Promise<{
        originalText: string;
        correctedText: string;
        corrections: Array<{
            type: 'grammar' | 'spelling' | 'punctuation' | 'style';
            original: string;
            corrected: string;
            explanation: string;
        }>;
        overallScore: number;
    }> {
        const operationId = this.startOperation('grammarCheck');

        try {
            const response = await fetch('/api/writing-tools/grammar-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to check grammar');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, correctionCount: result.corrections?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.grammarCheck');
            throw error;
        }
    }

    /**
     * توليد استشهاد مع مراقبة الأداء
     */
    async generateCitation(variables: GenerateCitationVariables, token?: string): Promise<{
        citation: string;
        style: CitationStyle;
        format: 'text' | 'bibtex' | 'ris';
    }> {
        const operationId = this.startOperation('generateCitation');

        try {
            const response = await fetch('/api/writing-tools/generate-citation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate citation');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, style: variables.style });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.generateCitation');
            throw error;
        }
    }

    /**
     * فحص الحقائق مع مراقبة شاملة
     */
    async factCheck(variables: FactCheckVariables, token?: string): Promise<{
        claims: Array<{
            claim: string;
            verdict: 'true' | 'false' | 'partially-true' | 'unverified';
            evidence: string[];
            confidence: number;
        }>;
        overallAccuracy: number;
        sources: string[];
    }> {
        const operationId = this.startOperation('factCheck');

        try {
            const response = await fetch('/api/writing-tools/fact-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fact-check content');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, claimCount: result.claims?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.factCheck');
            throw error;
        }
    }

    /**
     * فحص الانتحال مع مراقبة الأداء
     */
    async plagiarismCheck(variables: PlagiarismCheckVariables, token?: string): Promise<{
        plagiarismScore: number;
        matches: Array<{
            text: string;
            source: string;
            similarity: number;
            url?: string;
        }>;
        suggestions: string[];
        isOriginal: boolean;
    }> {
        const operationId = this.startOperation('plagiarismCheck');

        try {
            const response = await fetch('/api/writing-tools/plagiarism-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to check plagiarism');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, score: result.plagiarismScore });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.plagiarismCheck');
            throw error;
        }
    }

    /**
     * البحث بالذكاء الاصطناعي مع مراقبة شاملة
     */
    async aiResearcher(variables: AIResearcherVariables, token?: string): Promise<{
        topic: string;
        summary: string;
        keyFindings: string[];
        sources: Array<{
            title: string;
            url: string;
            relevance: number;
            snippet: string;
        }>;
        relatedTopics: string[];
    }> {
        const operationId = this.startOperation('aiResearcher');

        try {
            const response = await fetch('/api/writing-tools/ai-researcher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to perform AI research');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sourceCount: result.sources?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.aiResearcher');
            throw error;
        }
    }

    /**
     * شرح موضوع مع مراقبة الأداء
     */
    async explainTopic(variables: TopicExplainerVariables, token?: string): Promise<{
        topic: string;
        explanation: string;
        keyConcepts: string[];
        examples: string[];
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        relatedTopics: string[];
    }> {
        const operationId = this.startOperation('explainTopic');

        try {
            const response = await fetch('/api/writing-tools/explain-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to explain topic');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, conceptCount: result.keyConcepts?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.explainTopic');
            throw error;
        }
    }

    /**
     * إعادة كتابة النص مع مراقبة شاملة
     */
    async rewriteText(variables: RewriteTextVariables, token?: string): Promise<{
        originalText: string;
        rewrittenText: string;
        changes: string[];
        style: string;
        tone?: string;
    }> {
        const operationId = this.startOperation('rewriteText');

        try {
            const response = await fetch('/api/writing-tools/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to rewrite text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, style: variables.style });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.rewriteText');
            throw error;
        }
    }

    /**
     * ترجمة النص مع مراقبة الأداء
     */
    async translateText(variables: TranslateTextVariables, token?: string): Promise<{
        originalText: string;
        translatedText: string;
        fromLanguage: string;
        toLanguage: string;
        confidence: number;
        alternativeTranslations?: string[];
    }> {
        const operationId = this.startOperation('translateText');

        try {
            const response = await fetch('/api/writing-tools/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to translate text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, confidence: result.confidence });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.translateText');
            throw error;
        }
    }

    /**
     * توسيع النص مع مراقبة شاملة
     */
    async expandText(variables: ExpandTextVariables, token?: string): Promise<{
        originalText: string;
        expandedText: string;
        additions: string[];
        newWordCount: number;
        expansionRatio: number;
    }> {
        const operationId = this.startOperation('expandText');

        try {
            const response = await fetch('/api/writing-tools/expand', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to expand text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, targetLength: variables.targetLength });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.expandText');
            throw error;
        }
    }

    /**
     * اختصار النص مع مراقبة الأداء
     */
    async shortenText(variables: ShortenTextVariables, token?: string): Promise<{
        originalText: string;
        shortenedText: string;
        reductions: string[];
        newWordCount: number;
        reductionRatio: number;
    }> {
        const operationId = this.startOperation('shortenText');

        try {
            const response = await fetch('/api/writing-tools/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(variables)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to shorten text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, targetLength: variables.targetLength });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'WritingToolsServiceV2.shortenText');
            throw error;
        }
    }
}