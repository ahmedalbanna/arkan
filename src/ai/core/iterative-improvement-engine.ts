/**
 * محرك التحسين التكراري
 * يحسن المخرجات تدريجياً من خلال عدة تكرارات
 */

import { AdaptiveModelSelector, ModelConfig } from './adaptive-model-selector';
import { ContextAnalysisResult, ContextAnalyzer } from './context-analyzer';
import { IntelligentPromptBuilder, PromptBuildingConfig } from './intelligent-prompt-builder';
import { OutputQualityValidator, ValidationResult } from './output-quality-validator';

export interface ImprovementIteration {
    iterationNumber: number;
    input: string;
    output: string;
    qualityScore: number;
    issues: string[];
    improvements: string[];
    modelUsed: string;
    timestamp: Date;
}

export interface ImprovementSession {
    sessionId: string;
    originalInput: string;
    contextAnalysis: ContextAnalysisResult;
    iterations: ImprovementIteration[];
    finalOutput: string;
    totalImprovementScore: number;
    status: 'in_progress' | 'completed' | 'failed';
    maxIterations: number;
    qualityThreshold: number;
}

export interface ImprovementConfig {
    maxIterations?: number;
    qualityThreshold?: number;
    improvementStrategy?: 'aggressive' | 'balanced' | 'conservative';
    focusAreas?: Array<'completeness' | 'accuracy' | 'clarity' | 'structure' | 'relevance'>;
    allowModelSwitching?: boolean;
}

export class IterativeImprovementEngine {

    /**
     * تشغيل جلسة تحسين تكرارية كاملة
     */
    static async runImprovementSession(
        originalInput: string,
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement',
        domain: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>,
        config: ImprovementConfig = {}
    ): Promise<ImprovementSession> {

        const sessionId = this.generateSessionId();
        const maxIterations = config.maxIterations || 3;
        const qualityThreshold = config.qualityThreshold || 85;

        // تحليل السياق الأولي
        const contextAnalysis = await ContextAnalyzer.analyzeContext({
            userInput: originalInput,
            externalContext,
            guidelines: []
        });

        const session: ImprovementSession = {
            sessionId,
            originalInput,
            contextAnalysis,
            iterations: [],
            finalOutput: '',
            totalImprovementScore: 0,
            status: 'in_progress',
            maxIterations,
            qualityThreshold
        };

        try {
            let currentInput = originalInput;
            let currentOutput = '';
            let currentModelConfig: ModelConfig | null = null;

            for (let i = 1; i <= maxIterations; i++) {
                console.log(`بدء التكرار ${i} من ${maxIterations}`);

                // اختيار النموذج المناسب
                if (!currentModelConfig || config.allowModelSwitching) {
                    currentModelConfig = AdaptiveModelSelector.selectOptimalModel(
                        contextAnalysis,
                        taskType,
                        { taskType }
                    );
                }

                // بناء الـ prompt المحسن
                const promptConfig: PromptBuildingConfig = {
                    taskType,
                    domain,
                    contextAnalysis,
                    userInput: currentInput,
                    externalContext,
                    previousOutput: i > 1 ? currentOutput : undefined,
                    iterationCount: i
                };

                const promptTemplate = IntelligentPromptBuilder.buildPrompt(promptConfig);
                const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

                // تنفيذ التوليد
                currentOutput = await this.executeGeneration(compiledPrompt, currentModelConfig);

                // تقييم الجودة
                const validation = await OutputQualityValidator.validateOutput(
                    currentOutput,
                    originalInput,
                    contextAnalysis
                );

                // تسجيل التكرار
                const iteration: ImprovementIteration = {
                    iterationNumber: i,
                    input: currentInput,
                    output: currentOutput,
                    qualityScore: validation.metrics.overall,
                    issues: validation.issues.map(issue => issue.description),
                    improvements: validation.suggestions,
                    modelUsed: currentModelConfig.modelId,
                    timestamp: new Date()
                };

                session.iterations.push(iteration);

                console.log(`التكرار ${i}: نقاط الجودة = ${validation.metrics.overall}`);

                // فحص إذا وصلنا للجودة المطلوبة
                if (validation.metrics.overall >= qualityThreshold) {
                    console.log(`تم الوصول للجودة المطلوبة في التكرار ${i}`);
                    session.finalOutput = currentOutput;
                    session.status = 'completed';
                    break;
                }

                // إذا لم نصل للتكرار الأخير، حضر للتكرار التالي
                if (i < maxIterations) {
                    if (validation.needsImprovement && validation.improvementPrompt) {
                        currentInput = validation.improvementPrompt;

                        // تعديل تكوين النموذج بناءً على النتائج
                        if (config.allowModelSwitching) {
                            currentModelConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
                                currentModelConfig,
                                validation.metrics.overall,
                                validation.issues.map(issue => issue.type)
                            );
                        }
                    } else {
                        // إذا لم نحصل على prompt للتحسين، استخدم استراتيجية بديلة
                        currentInput = this.generateFallbackImprovementPrompt(
                            currentOutput,
                            validation,
                            config.improvementStrategy || 'balanced'
                        );
                    }
                } else {
                    // التكرار الأخير
                    session.finalOutput = currentOutput;
                    session.status = validation.metrics.overall >= 70 ? 'completed' : 'failed';
                }
            }

            // حساب نقاط التحسين الإجمالية
            session.totalImprovementScore = this.calculateTotalImprovement(session);

            console.log(`انتهت الجلسة: النقاط النهائية = ${session.iterations[session.iterations.length - 1]?.qualityScore || 0}`);

        } catch (error) {
            console.error('خطأ في جلسة التحسين:', error);
            session.status = 'failed';
            session.finalOutput = session.iterations[session.iterations.length - 1]?.output || '';
        }

        return session;
    }

    /**
     * تنفيذ توليد واحد
     */
    private static async executeGeneration(prompt: string, modelConfig: ModelConfig): Promise<string> {
        // هنا يتم استدعاء النموذج الفعلي
        // في التطبيق الحقيقي، سيتم استخدام Genkit

        try {
            // محاكاة استدعاء النموذج
            console.log(`استخدام النموذج: ${modelConfig.modelId}`);
            console.log(`المعاملات: temp=${modelConfig.temperature}, tokens=${modelConfig.maxOutputTokens}`);

            // في التطبيق الحقيقي، سيكون هذا:
            // const result = await ai.generate({
            //   model: modelConfig.modelId,
            //   prompt: prompt,
            //   config: {
            //     temperature: modelConfig.temperature,
            //     maxOutputTokens: modelConfig.maxOutputTokens,
            //     topP: modelConfig.topP,
            //     topK: modelConfig.topK
            //   }
            // });
            // return result.text();

            // محاكاة للاختبار
            return `محتوى محسن تم توليده باستخدام ${modelConfig.modelId}\n\nالمحتوى يتضمن:\n- تحليل شامل\n- معلومات دقيقة\n- هيكل منظم\n- لغة واضحة\n\nتم التوليد بمعاملات محسنة للحصول على أفضل جودة.`;

        } catch (error) {
            console.error('خطأ في التوليد:', error);
            throw new Error(`فشل في التوليد: ${error}`);
        }
    }

    /**
     * إنتاج prompt احتياطي للتحسين
     */
    private static generateFallbackImprovementPrompt(
        currentOutput: string,
        validation: ValidationResult,
        strategy: 'aggressive' | 'balanced' | 'conservative'
    ): string {

        let prompt = 'يرجى تحسين المحتوى التالي:\n\n';
        prompt += currentOutput + '\n\n';

        prompt += 'التحسينات المطلوبة:\n';

        switch (strategy) {
            case 'aggressive':
                prompt += '- أعد كتابة المحتوى بالكامل لجعله أكثر شمولية ودقة\n';
                prompt += '- أضف المزيد من التفاصيل والأمثلة\n';
                prompt += '- حسن الهيكل والتنظيم بشكل جذري\n';
                break;

            case 'balanced':
                prompt += '- حسن الوضوح والتنظيم\n';
                prompt += '- أضف المعلومات المفقودة\n';
                prompt += '- اجعل اللغة أكثر دقة\n';
                break;

            case 'conservative':
                prompt += '- اجعل التحسينات طفيفة\n';
                prompt += '- ركز على تصحيح الأخطاء الواضحة\n';
                prompt += '- حافظ على الهيكل الأساسي\n';
                break;
        }

        // إضافة مشاكل محددة من التقييم
        if (validation.issues.length > 0) {
            prompt += '\nالمشاكل المحددة التي يجب معالجتها:\n';
            validation.issues.forEach((issue, index) => {
                prompt += `${index + 1}. ${issue.description}\n`;
            });
        }

        return prompt;
    }

    /**
     * حساب نقاط التحسين الإجمالية
     */
    private static calculateTotalImprovement(session: ImprovementSession): number {
        if (session.iterations.length === 0) return 0;

        const firstScore = session.iterations[0].qualityScore;
        const lastScore = session.iterations[session.iterations.length - 1].qualityScore;

        return lastScore - firstScore;
    }

    /**
     * تحليل اتجاه التحسين
     */
    static analyzeImprovementTrend(session: ImprovementSession): {
        trend: 'improving' | 'declining' | 'stable';
        averageImprovement: number;
        bestIteration: number;
        recommendations: string[];
    } {

        if (session.iterations.length < 2) {
            return {
                trend: 'stable',
                averageImprovement: 0,
                bestIteration: 1,
                recommendations: ['يحتاج المزيد من التكرارات للتقييم']
            };
        }

        const scores = session.iterations.map(iter => iter.qualityScore);
        const improvements = [];

        for (let i = 1; i < scores.length; i++) {
            improvements.push(scores[i] - scores[i - 1]);
        }

        const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
        const bestIteration = scores.indexOf(Math.max(...scores)) + 1;

        let trend: 'improving' | 'declining' | 'stable';
        if (averageImprovement > 2) trend = 'improving';
        else if (averageImprovement < -2) trend = 'declining';
        else trend = 'stable';

        const recommendations: string[] = [];

        switch (trend) {
            case 'improving':
                recommendations.push('التحسين يسير في الاتجاه الصحيح');
                if (averageImprovement > 10) {
                    recommendations.push('يمكن زيادة عدد التكرارات للحصول على نتائج أفضل');
                }
                break;

            case 'declining':
                recommendations.push('جودة المخرجات تتراجع - راجع الاستراتيجية');
                recommendations.push('قد تحتاج لتغيير النموذج أو المعاملات');
                break;

            case 'stable':
                recommendations.push('التحسين محدود - قد تحتاج لتغيير النهج');
                if (scores[scores.length - 1] < 70) {
                    recommendations.push('النتائج دون المستوى المطلوب - راجع المدخلات');
                }
                break;
        }

        return {
            trend,
            averageImprovement,
            bestIteration,
            recommendations
        };
    }

    /**
     * الحصول على أفضل مخرجات من الجلسة
     */
    static getBestOutput(session: ImprovementSession): {
        output: string;
        iterationNumber: number;
        qualityScore: number;
    } {

        if (session.iterations.length === 0) {
            return {
                output: '',
                iterationNumber: 0,
                qualityScore: 0
            };
        }

        let bestIteration = session.iterations[0];

        for (const iteration of session.iterations) {
            if (iteration.qualityScore > bestIteration.qualityScore) {
                bestIteration = iteration;
            }
        }

        return {
            output: bestIteration.output,
            iterationNumber: bestIteration.iterationNumber,
            qualityScore: bestIteration.qualityScore
        };
    }

    /**
     * إنتاج تقرير مفصل عن الجلسة
     */
    static generateSessionReport(session: ImprovementSession): string {
        let report = `# تقرير جلسة التحسين التكراري\n\n`;

        report += `**معرف الجلسة:** ${session.sessionId}\n`;
        report += `**الحالة:** ${session.status}\n`;
        report += `**عدد التكرارات:** ${session.iterations.length}\n`;
        report += `**نقاط التحسين الإجمالية:** ${session.totalImprovementScore.toFixed(1)}\n\n`;

        // تحليل الاتجاه
        const trendAnalysis = this.analyzeImprovementTrend(session);
        report += `## تحليل الاتجاه\n`;
        report += `**الاتجاه:** ${trendAnalysis.trend}\n`;
        report += `**متوسط التحسين:** ${trendAnalysis.averageImprovement.toFixed(1)}\n`;
        report += `**أفضل تكرار:** ${trendAnalysis.bestIteration}\n\n`;

        // التوصيات
        report += `## التوصيات\n`;
        trendAnalysis.recommendations.forEach((rec, index) => {
            report += `${index + 1}. ${rec}\n`;
        });
        report += '\n';

        // تفاصيل التكرارات
        report += `## تفاصيل التكرارات\n\n`;
        session.iterations.forEach(iteration => {
            report += `### التكرار ${iteration.iterationNumber}\n`;
            report += `- **النقاط:** ${iteration.qualityScore}\n`;
            report += `- **النموذج:** ${iteration.modelUsed}\n`;
            report += `- **عدد المشاكل:** ${iteration.issues.length}\n`;
            if (iteration.issues.length > 0) {
                report += `- **المشاكل الرئيسية:** ${iteration.issues.slice(0, 3).join('، ')}\n`;
            }
            report += '\n';
        });

        return report;
    }

    /**
     * Helper methods
     */
    private static generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * حفظ جلسة التحسين (للمراجعة المستقبلية)
     */
    static async saveSession(session: ImprovementSession): Promise<void> {
        // في التطبيق الحقيقي، سيتم حفظ الجلسة في قاعدة البيانات
        console.log(`حفظ الجلسة: ${session.sessionId}`);

        // يمكن إضافة منطق الحفظ هنا
        // await database.sessions.save(session);
    }

    /**
     * استرجاع جلسة محفوظة
     */
    static async loadSession(sessionId: string): Promise<ImprovementSession | null> {
        // في التطبيق الحقيقي، سيتم استرجاع الجلسة من قاعدة البيانات
        console.log(`استرجاع الجلسة: ${sessionId}`);

        // يمكن إضافة منطق الاسترجاع هنا
        // return await database.sessions.findById(sessionId);

        return null;
    }
}
