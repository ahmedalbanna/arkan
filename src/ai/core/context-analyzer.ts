/**
 * نظام ذكي لتحليل السياق وفهم المتطلبات
 * يحلل المدخلات ويستخرج المعلومات الضرورية لتوليد مخرجات دقيقة
 */

import { z } from 'zod';

export interface ContextAnalysisResult {
    // تحليل نوع المحتوى المطلوب
    contentType: 'technical' | 'business' | 'academic' | 'creative' | 'mixed';

    // مستوى التعقيد المطلوب
    complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';

    // الجمهور المستهدف
    targetAudience: 'general' | 'technical' | 'executive' | 'academic' | 'student';

    // اللغة والثقافة
    language: 'ar' | 'en';
    culturalContext: 'middle-east' | 'western' | 'global';

    // المتطلبات المحددة
    specificRequirements: string[];

    // السياق الخارجي المتاح
    availableContext: {
        files: Array<{ name: string; type: string; relevance: number }>;
        previousSections: string[];
        guidelines: string[];
    };

    // التوصيات للنموذج
    modelRecommendation: {
        primary: string;
        fallback: string;
        reasoning: string;
    };
}

export class ContextAnalyzer {
    /**
     * تحليل شامل للسياق والمتطلبات
     */
    static async analyzeContext(input: {
        userInput: string;
        projectType?: string;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
        guidelines?: string[];
        previousOutput?: string;
    }): Promise<ContextAnalysisResult> {

        // تحليل نوع المحتوى من النص
        const contentType = this.detectContentType(input.userInput);

        // تحديد مستوى التعقيد
        const complexityLevel = this.assessComplexity(input.userInput, input.externalContext);

        // تحديد الجمهور المستهدف
        const targetAudience = this.identifyAudience(input.userInput, input.projectType);

        // تحليل اللغة والسياق الثقافي
        const { language, culturalContext } = this.analyzeCulturalContext(input.userInput);

        // استخراج المتطلبات المحددة
        const specificRequirements = this.extractRequirements(input.userInput, input.guidelines);

        // تحليل السياق المتاح
        const availableContext = this.analyzeAvailableContext(input.externalContext, input.guidelines);

        // توصية النموذج المناسب
        const modelRecommendation = this.recommendModel(contentType, complexityLevel, targetAudience);

        return {
            contentType,
            complexityLevel,
            targetAudience,
            language,
            culturalContext,
            specificRequirements,
            availableContext,
            modelRecommendation
        };
    }

    private static detectContentType(input: string): ContextAnalysisResult['contentType'] {
        const technicalKeywords = ['api', 'database', 'algorithm', 'architecture', 'system', 'code', 'technical'];
        const businessKeywords = ['business', 'market', 'revenue', 'strategy', 'proposal', 'plan', 'budget'];
        const academicKeywords = ['research', 'study', 'analysis', 'thesis', 'academic', 'methodology'];
        const creativeKeywords = ['creative', 'design', 'story', 'content', 'marketing', 'brand'];

        const lowerInput = input.toLowerCase();

        const scores = {
            technical: technicalKeywords.filter(kw => lowerInput.includes(kw)).length,
            business: businessKeywords.filter(kw => lowerInput.includes(kw)).length,
            academic: academicKeywords.filter(kw => lowerInput.includes(kw)).length,
            creative: creativeKeywords.filter(kw => lowerInput.includes(kw)).length
        };

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) return 'mixed';

        const topTypes = Object.entries(scores).filter(([_, score]) => score === maxScore);
        return topTypes.length > 1 ? 'mixed' : topTypes[0][0] as ContextAnalysisResult['contentType'];
    }

    private static assessComplexity(
        input: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>
    ): ContextAnalysisResult['complexityLevel'] {
        let complexityScore = 0;

        // طول النص
        if (input.length > 1000) complexityScore += 2;
        else if (input.length > 500) complexityScore += 1;

        // وجود مصطلحات تقنية معقدة
        const complexTerms = ['architecture', 'integration', 'optimization', 'scalability', 'methodology'];
        complexityScore += complexTerms.filter(term => input.toLowerCase().includes(term)).length;

        // وجود سياق خارجي
        if (externalContext && externalContext.length > 0) {
            complexityScore += Math.min(externalContext.length, 3);
        }

        if (complexityScore >= 6) return 'expert';
        if (complexityScore >= 4) return 'advanced';
        if (complexityScore >= 2) return 'intermediate';
        return 'basic';
    }

    private static identifyAudience(input: string, projectType?: string): ContextAnalysisResult['targetAudience'] {
        const executiveKeywords = ['executive', 'management', 'strategy', 'roi', 'business case'];
        const technicalKeywords = ['developer', 'engineer', 'technical', 'implementation', 'code'];
        const academicKeywords = ['research', 'academic', 'study', 'thesis', 'methodology'];
        const studentKeywords = ['student', 'learning', 'homework', 'assignment', 'exam'];

        const lowerInput = input.toLowerCase();

        if (studentKeywords.some(kw => lowerInput.includes(kw))) return 'student';
        if (academicKeywords.some(kw => lowerInput.includes(kw))) return 'academic';
        if (executiveKeywords.some(kw => lowerInput.includes(kw))) return 'executive';
        if (technicalKeywords.some(kw => lowerInput.includes(kw))) return 'technical';

        return 'general';
    }

    private static analyzeCulturalContext(input: string): {
        language: 'ar' | 'en';
        culturalContext: 'middle-east' | 'western' | 'global'
    } {
        // تحديد اللغة بناءً على الأحرف
        const arabicRegex = /[\u0600-\u06FF]/;
        const language = arabicRegex.test(input) ? 'ar' : 'en';

        // تحديد السياق الثقافي
        const middleEastKeywords = ['الشرق الأوسط', 'العربي', 'الخليج', 'middle east', 'gulf', 'arab'];
        const westernKeywords = ['western', 'europe', 'america', 'us', 'eu'];

        const lowerInput = input.toLowerCase();

        let culturalContext: 'middle-east' | 'western' | 'global' = 'global';
        if (middleEastKeywords.some(kw => lowerInput.includes(kw))) {
            culturalContext = 'middle-east';
        } else if (westernKeywords.some(kw => lowerInput.includes(kw))) {
            culturalContext = 'western';
        }

        return { language, culturalContext };
    }

    private static extractRequirements(input: string, guidelines?: string[]): string[] {
        const requirements: string[] = [];

        // استخراج المتطلبات من النص
        const requirementPatterns = [
            /يجب أن (.*?)(?:\.|$)/g,
            /must (.*?)(?:\.|$)/gi,
            /should (.*?)(?:\.|$)/gi,
            /need to (.*?)(?:\.|$)/gi,
            /required to (.*?)(?:\.|$)/gi
        ];

        requirementPatterns.forEach(pattern => {
            const matches = input.match(pattern);
            if (matches) {
                requirements.push(...matches.map(match => match.trim()));
            }
        });

        // إضافة الإرشادات كمتطلبات
        if (guidelines) {
            requirements.push(...guidelines);
        }

        return requirements;
    }

    private static analyzeAvailableContext(
        externalContext?: Array<{ fileName: string; content: string; type: string }>,
        guidelines?: string[]
    ) {
        const files = externalContext?.map(file => ({
            name: file.fileName,
            type: file.type,
            relevance: this.calculateRelevance(file.content || '', file.type)
        })) || [];

        return {
            files,
            previousSections: [], // سيتم تحديثها حسب السياق
            guidelines: guidelines || []
        };
    }

    private static calculateRelevance(content: string, type: string): number {
        // حساب مدى صلة الملف بالمهمة
        let relevance = 0.5; // قيمة افتراضية

        if (type === 'context') relevance += 0.3;
        if (type === 'example') relevance += 0.2;

        // التحقق من وجود المحتوى قبل حساب الطول
        if (content && typeof content === 'string' && content.length > 1000) {
            relevance += 0.1;
        }

        return Math.min(relevance, 1.0);
    }

    private static recommendModel(
        contentType: ContextAnalysisResult['contentType'],
        complexityLevel: ContextAnalysisResult['complexityLevel'],
        targetAudience: ContextAnalysisResult['targetAudience']
    ): ContextAnalysisResult['modelRecommendation'] {

        // قواعد اختيار النموذج
        if (complexityLevel === 'expert' || contentType === 'technical') {
            return {
                primary: 'googleai/gemini-1.5-pro',
                fallback: 'googleai/gemini-2.0-flash',
                reasoning: 'Complex technical content requires advanced reasoning capabilities'
            };
        }

        if (contentType === 'creative' || targetAudience === 'executive') {
            return {
                primary: 'googleai/gemini-1.5-pro',
                fallback: 'googleai/gemini-2.0-flash',
                reasoning: 'Creative content and executive communication benefit from advanced language models'
            };
        }

        return {
            primary: 'googleai/gemini-2.0-flash',
            fallback: 'googleai/gemini-1.5-pro',
            reasoning: 'Fast and efficient model suitable for general-purpose tasks'
        };
    }
}

// Schema للتحقق من صحة نتائج التحليل
export const ContextAnalysisSchema = z.object({
    contentType: z.enum(['technical', 'business', 'academic', 'creative', 'mixed']),
    complexityLevel: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
    targetAudience: z.enum(['general', 'technical', 'executive', 'academic', 'student']),
    language: z.enum(['ar', 'en']),
    culturalContext: z.enum(['middle-east', 'western', 'global']),
    specificRequirements: z.array(z.string()),
    availableContext: z.object({
        files: z.array(z.object({
            name: z.string(),
            type: z.string(),
            relevance: z.number().min(0).max(1)
        })),
        previousSections: z.array(z.string()),
        guidelines: z.array(z.string())
    }),
    modelRecommendation: z.object({
        primary: z.string(),
        fallback: z.string(),
        reasoning: z.string()
    })
});
