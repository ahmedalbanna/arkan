/**
 * مساعدات سريعة للذكاء الاصطناعي - Quick AI Helpers
 * يوفر واجهات مبسطة للمهام البسيطة التي لا تحتاج تحليل معقد
 */

import { ai } from '@/ai/genkit';
import { AdaptiveModelSelector } from './adaptive-model-selector';
import { ContextAnalyzer } from './context-analyzer';
import { OutputQualityValidator } from './output-quality-validator';

/**
 * واجهة المساعدات السريعة
 */
export interface QuickHelperResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime?: number;
}

/**
 * مساعدات سريعة للذكاء الاصطناعي
 */
export class QuickAIHelpers {

    /**
     * تحليل سريع لنوع المحتوى والتعقيد
     */
    static async quickAnalyze(text: string): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const analysis = await ContextAnalyzer.analyzeContext({
                userInput: text
            });

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    contentType: analysis.contentType,
                    complexity: analysis.complexityLevel,
                    audience: analysis.targetAudience,
                    language: analysis.language,
                    culturalContext: analysis.culturalContext,
                    recommendedModel: analysis.modelRecommendation.primary,
                    fallbackModel: analysis.modelRecommendation.fallback,
                    reasoning: analysis.modelRecommendation.reasoning,
                    specificRequirements: analysis.specificRequirements
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في التحليل السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تقييم سريع لجودة المخرجات
     */
    static async quickValidate(output: string, input: string): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            // تحليل سريع للسياق
            const contextAnalysis = await ContextAnalyzer.analyzeContext({
                userInput: input
            });

            const validation = await OutputQualityValidator.validateOutput(
                output,
                input,
                contextAnalysis
            );

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    score: validation.metrics.overall,
                    isGood: validation.metrics.overall >= 70,
                    needsImprovement: validation.needsImprovement,
                    mainIssues: validation.issues.slice(0, 3).map(issue => ({
                        type: issue.type,
                        description: issue.description,
                        suggestion: issue.suggestion
                    })),
                    metrics: {
                        completeness: validation.metrics.completeness,
                        accuracy: validation.metrics.accuracy,
                        relevance: validation.metrics.relevance,
                        clarity: validation.metrics.clarity,
                        structure: validation.metrics.structure
                    },
                    suggestions: validation.suggestions.slice(0, 5)
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في التقييم السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * اقتراح النموذج المناسب للمهمة
     */
    static async suggestModel(text: string, taskType: 'generation' | 'analysis' | 'translation' | 'improvement'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const contextAnalysis = await ContextAnalyzer.analyzeContext({
                userInput: text
            });

            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                taskType
            );

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    model: modelConfig.modelId,
                    reasoning: modelConfig.reasoning,
                    temperature: modelConfig.temperature,
                    maxTokens: modelConfig.maxOutputTokens,
                    topP: modelConfig.topP,
                    topK: modelConfig.topK,
                    taskType,
                    complexity: contextAnalysis.complexityLevel,
                    contentType: contextAnalysis.contentType
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في اقتراح النموذج',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تلخيص سريع للنص
     */
    static async quickSummarize(text: string, length: 'short' | 'medium' | 'long' = 'medium'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const lengthDescriptions: Record<string, string> = {
                short: "فقرة واحدة مختصرة",
                medium: "بضعة فقرات تغطي النقاط الرئيسية",
                long: "ملخص مفصل يغطي جميع المواضيع المهمة"
            };

            const summarizePrompt = ai.definePrompt({
                name: 'quickSummarizePrompt',
                model: 'googleai/gemini-2.0-flash',
                prompt: `أنت خبير في التلخيص. مهمتك هي قراءة النص المقدم وإنشاء ملخص بالطول المطلوب.

**الطول المطلوب**: ${lengthDescriptions[length]}

**النص الأصلي:**
---
{{{text}}}
---

**الملخص:**`,
                config: {
                    temperature: 0.3,
                    maxOutputTokens: length === 'short' ? 500 : length === 'medium' ? 1000 : 2000
                }
            });

            const { output } = await summarizePrompt({ text });

            if (!output) {
                throw new Error('فشل في إنشاء الملخص');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    summary: output.replace(/---/g, '').trim(),
                    originalLength: text.length,
                    summaryLength: output.length,
                    compressionRatio: Math.round((output.length / text.length) * 100),
                    length
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في التلخيص السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * فحص سريع للحقائق
     */
    static async quickFactCheck(text: string): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const factCheckPrompt = ai.definePrompt({
                name: 'quickFactCheckPrompt',
                model: 'googleai/gemini-2.0-flash',
                prompt: `أنت خبير في فحص الحقائق. مهمتك هي تحليل النص المقدم وتحديد الادعاءات القابلة للتحقق وتقييم دقتها.

**عملية التحليل:**
1. **تحديد الادعاءات**: اقرأ النص بعناية واستخرج جميع العبارات المحددة والحقائقية التي يمكن التحقق منها
2. **التحقق من الادعاءات**: لكل ادعاء، حدد حالته ('Verified', 'False', أو 'Inconclusive')
3. **العثور على مصدر**: قدم مصدراً واحداً عالي الجودة وموثوقاً يدعم تحققك
4. **شرح الاستدلال**: اشرح باختصار استنتاجك لكل ادعاء
5. **حساب نقاط الأصالة**: بناءً على دقة الادعاءات، قدم نقاط الأصالة/الدقة الإجمالية من 0 إلى 100

**النص المراد تحليله:**
---
{{{text}}}
---`,
                config: {
                    temperature: 0.2,
                    maxOutputTokens: 1500
                }
            });

            const { output } = await factCheckPrompt({ text });

            if (!output) {
                throw new Error('فشل في فحص الحقائق');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    claims: this.extractClaims(output),
                    originalityScore: this.extractScore(output),
                    overallAssessment: this.extractAssessment(output),
                    recommendations: this.extractRecommendations(output)
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في فحص الحقائق السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * بحث سريع عن موضوع
     */
    static async quickResearch(topic: string): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const researchPrompt = ai.definePrompt({
                name: 'quickResearchPrompt',
                model: 'googleai/gemini-2.0-flash',
                prompt: `أنت مساعد بحث خبير. مهمتك هي إجراء بحث شامل حول الموضوع المحدد وتقديم تقرير منظم.

**عملية البحث:**
1. **فهم الموضوع**: حلل بعمق موضوع البحث المطلوب
2. **جمع المعلومات**: ابحث عن معلومات ذات صلة وموثوقة من مصادر مختلفة
3. **توليف النتائج**: دمج المعلومات في ملخص شامل
4. **استخراج النقاط الرئيسية**: حدد أهم الحقائق والإحصائيات أو النتائج
5. **استشهاد المصادر**: اذكر URLs للمصادر الأساسية المستخدمة في البحث

**الموضوع:**
---
{{{topic}}}
---`,
                config: {
                    temperature: 0.4,
                    maxOutputTokens: 2000
                }
            });

            const { output } = await researchPrompt({ topic });

            if (!output) {
                throw new Error('فشل في البحث السريع');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    summary: output,
                    keyPoints: this.extractKeyPoints(output),
                    sources: this.extractSources(output),
                    topic,
                    researchDepth: this.assessResearchDepth(output)
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في البحث السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تحسين سريع للنص
     */
    static async quickImprove(text: string, focusArea?: 'clarity' | 'grammar' | 'style' | 'structure'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const focusInstructions = {
                clarity: 'ركز على وضوح المعنى وسهولة الفهم',
                grammar: 'ركز على القواعد النحوية والإملائية',
                style: 'ركز على الأسلوب والتناسق',
                structure: 'ركز على التنظيم والهيكلة'
            };

            const improvePrompt = ai.definePrompt({
                name: 'quickImprovePrompt',
                model: 'googleai/gemini-2.0-flash',
                prompt: `أنت خبير في تحسين النصوص. مهمتك هي تحسين النص المقدم مع التركيز على ${focusArea ? focusInstructions[focusArea] : 'التحسين العام'}.

**النص الأصلي:**
---
{{{text}}}
---

**النص المحسن:**`,
                config: {
                    temperature: 0.5,
                    maxOutputTokens: Math.max(text.length * 1.2, 1000)
                }
            });

            const { output } = await improvePrompt({ text });

            if (!output) {
                throw new Error('فشل في تحسين النص');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    improvedText: output.replace(/---/g, '').trim(),
                    originalText: text,
                    improvements: this.identifyImprovements(text, output),
                    focusArea: focusArea || 'general',
                    improvementRatio: Math.round(((output.length - text.length) / text.length) * 100)
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في تحسين النص السريع',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * ترجمة سريعة للنص
     */
    static async quickTranslate(text: string, targetLanguage: 'ar' | 'en'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const languageNames = {
                ar: 'العربية',
                en: 'الإنجليزية'
            };

            const translatePrompt = ai.definePrompt({
                name: 'quickTranslatePrompt',
                model: 'googleai/gemini-2.0-flash',
                prompt: `أنت خبير في الترجمة. مهمتك هي ترجمة النص المقدم إلى ${languageNames[targetLanguage]} بدقة ووضوح.

**النص المراد ترجمته:**
---
{{{text}}}
---

**الترجمة:**`,
                config: {
                    temperature: 0.3,
                    maxOutputTokens: Math.max(text.length * 1.5, 1000)
                }
            });

            const { output } = await translatePrompt({ text });

            if (!output) {
                throw new Error('فشل في الترجمة');
            }

            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    translatedText: output.replace(/---/g, '').trim(),
                    originalText: text,
                    targetLanguage,
                    translationQuality: this.assessTranslationQuality(text, output),
                    wordCount: output.split(' ').length
                },
                executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ في الترجمة السريعة',
                executionTime: Date.now() - startTime
            };
        }
    }

    // Helper methods for data extraction and processing

    private static extractClaims(output: string): Array<{ claim: string, status: string, source?: string }> {
        // Extract claims from fact-check output
        const claims: Array<{ claim: string, status: string, source?: string }> = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.includes('Claim:') || line.includes('ادعاء:')) {
                const claim = line.replace(/^(Claim:|ادعاء:)\s*/i, '').trim();
                if (claim) {
                    claims.push({ claim, status: 'Unknown' });
                }
            }
        }

        return claims;
    }

    private static extractScore(output: string): number {
        // Extract originality score from output
        const scoreMatch = output.match(/(\d+)\s*(?:نقطة|score|points)/i);
        return scoreMatch ? parseInt(scoreMatch[1]) : 0;
    }

    private static extractAssessment(output: string): string {
        // Extract overall assessment
        if (output.includes('Verified') || output.includes('موثق')) {
            return 'Verified';
        } else if (output.includes('False') || output.includes('خاطئ')) {
            return 'False';
        } else {
            return 'Inconclusive';
        }
    }

    private static extractRecommendations(output: string): string[] {
        // Extract recommendations
        const recommendations: string[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.includes('Recommendation:') || line.includes('توصية:')) {
                const rec = line.replace(/^(Recommendation:|توصية:)\s*/i, '').trim();
                if (rec) {
                    recommendations.push(rec);
                }
            }
        }

        return recommendations;
    }

    private static extractKeyPoints(output: string): string[] {
        // Extract key points from research output
        const keyPoints: string[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
                const point = line.replace(/^[-•*\d.\s]+/, '').trim();
                if (point) {
                    keyPoints.push(point);
                }
            }
        }

        return keyPoints.slice(0, 5); // Limit to 5 key points
    }

    private static extractSources(output: string): string[] {
        // Extract sources from research output
        const sources: string[] = [];
        const urlRegex = /https?:\/\/[^\s]+/g;
        const matches = output.match(urlRegex);

        if (matches) {
            sources.push(...matches.slice(0, 3)); // Limit to 3 sources
        }

        return sources;
    }

    private static assessResearchDepth(output: string): 'shallow' | 'moderate' | 'deep' {
        // Assess research depth based on output length and content
        if (output.length > 1500) return 'deep';
        if (output.length > 800) return 'moderate';
        return 'shallow';
    }

    private static identifyImprovements(original: string, improved: string): string[] {
        // Identify specific improvements made
        const improvements: string[] = [];

        if (improved.length > original.length * 1.1) {
            improvements.push('تم إضافة تفاصيل إضافية');
        }

        if (improved.length < original.length * 0.9) {
            improvements.push('تم تحسين الإيجاز');
        }

        if (improved.includes('أولاً') || improved.includes('ثانياً')) {
            improvements.push('تم تحسين التنظيم');
        }

        return improvements;
    }

    private static assessTranslationQuality(original: string, translated: string): 'excellent' | 'good' | 'fair' {
        // Assess translation quality based on length and structure
        const lengthRatio = translated.length / original.length;

        if (lengthRatio > 0.8 && lengthRatio < 1.2) {
            return 'excellent';
        } else if (lengthRatio > 0.6 && lengthRatio < 1.4) {
            return 'good';
        } else {
            return 'fair';
        }
    }
}

/**
 * واجهة مبسطة للمساعدات السريعة
 */
export const QuickHelpers = {
    analyze: QuickAIHelpers.quickAnalyze,
    validate: QuickAIHelpers.quickValidate,
    suggestModel: QuickAIHelpers.suggestModel,
    summarize: QuickAIHelpers.quickSummarize,
    factCheck: QuickAIHelpers.quickFactCheck,
    research: QuickAIHelpers.quickResearch,
    improve: QuickAIHelpers.quickImprove,
    translate: QuickAIHelpers.quickTranslate
};
