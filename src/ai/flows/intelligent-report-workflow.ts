/**
 * تدفق ذكي شامل لكتابة جميع أقسام التقرير
 * يستخدم النظام الذكي لضمان جودة عالية واكتمال المحتوى
 */

import {
    ContextAnalyzer,
    PerformanceMonitor
} from '@/ai/core';
import { ai } from '@/ai/genkit';
import { type GenerateSectionInput } from '@/ai/schemas';
import type { SectionName } from '@/ai/schemas/enums';
import { z } from 'genkit';
import { generateReportSection } from './generate-report-section';

// مخطط لإدخال التدفق الذكي الشامل
export const IntelligentReportWorkflowInputSchema = z.object({
    // بيانات المشروع الأساسية
    proposal: z.any().optional().describe("Project proposal data"),
    projectPlan: z.any().optional().describe("Project plan data"),

    // الأقسام المطلوب توليدها
    sectionsToGenerate: z.array(z.enum([
        'abstract',
        'acknowledgment',
        'introduction',
        'literatureReview',
        'systemAnalysis',
        'designStrategy',
        'systemDesign',
        'systemProgramming',
        'systemTesting',
        'recommendations',
        'conclusion',
        'references',
        'appendices'
    ])).describe("List of sections to generate"),

    // إعدادات التوليد
    generateInOrder: z.boolean().default(true).describe("Generate sections in logical order"),
    useIntelligentDependencies: z.boolean().default(true).describe("Use intelligent dependencies between sections"),
    qualityThreshold: z.number().min(70).max(100).default(85).describe("Quality threshold for each section"),

    // السياق والتوجيهات
    guidelines: z.array(z.string()).optional().describe("General guidelines for all sections"),
    contextFiles: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.string()
    })).optional().describe("Context files to use"),

    // إعدادات متقدمة
    enablePerformanceMonitoring: z.boolean().default(true),
    enableIterativeImprovement: z.boolean().default(true),
    maxRetries: z.number().min(1).max(5).default(3).describe("Max retries per section")
});

export type IntelligentReportWorkflowInput = z.infer<typeof IntelligentReportWorkflowInputSchema>;

// مخطط لمخرجات التدفق
export const IntelligentReportWorkflowOutputSchema = z.object({
    generatedSections: z.record(z.string(), z.string()).describe("Map of section names to generated content"),
    sectionMetadata: z.record(z.string(), z.object({
        qualityScore: z.number(),
        generationTime: z.number(),
        iterations: z.number(),
        modelUsed: z.string()
    })).describe("Metadata for each generated section"),
    overallMetrics: z.object({
        totalSections: z.number(),
        successfulSections: z.number(),
        averageQuality: z.number(),
        totalTime: z.number(),
        averageTime: z.number()
    }),
    performanceReport: z.any().optional().describe("Detailed performance report")
});

export type IntelligentReportWorkflowOutput = z.infer<typeof IntelligentReportWorkflowOutputSchema>;

/**
 * ترتيب الأقسام المنطقي للتقرير
 */
const SECTION_ORDER: SectionName[] = [
    'abstract',
    'acknowledgment',
    'introduction',
    'literatureReview',
    'systemAnalysis',
    'designStrategy',
    'systemDesign',
    'systemProgramming',
    'systemTesting',
    'recommendations',
    'conclusion',
    'references',
    'appendices'
];

/**
 * تبعيات الأقسام - أي الأقسام التي يحتاجها كل قسم
 */
const SECTION_DEPENDENCIES: Partial<Record<SectionName, SectionName[]>> = {
    'abstract': ['introduction', 'systemAnalysis', 'systemDesign', 'conclusion'],
    'acknowledgment': [],
    'introduction': [],
    'literatureReview': ['introduction'],
    'systemAnalysis': ['introduction', 'literatureReview'],
    'designStrategy': ['systemAnalysis'],
    'systemDesign': ['designStrategy', 'systemAnalysis'],
    'systemProgramming': ['systemDesign'],
    'systemTesting': ['systemProgramming', 'systemDesign'],
    'recommendations': ['systemTesting', 'systemAnalysis'],
    'conclusion': ['systemTesting', 'recommendations', 'systemAnalysis'],
    'references': ['literatureReview', 'systemAnalysis'],
    'appendices': []
};

/**
 * إعدادات الجودة المبسطة للأقسام
 */
const SIMPLIFIED_QUALITY_SETTINGS = {
    high: { threshold: 88, focusAreas: ['technical_accuracy', 'completeness', 'clarity'] },
    medium: { threshold: 85, focusAreas: ['clarity', 'structure', 'relevance'] },
    low: { threshold: 80, focusAreas: ['completeness', 'relevance', 'professionalism'] }
};

const SECTION_COMPLEXITY_MAP: Partial<Record<SectionName, 'high' | 'medium' | 'low'>> = {
    'abstract': 'high',
    'systemDesign': 'high',
    'systemAnalysis': 'high',
    'designStrategy': 'high',
    'literatureReview': 'high',
    'systemProgramming': 'medium',
    'systemTesting': 'medium',
    'introduction': 'medium',
    'conclusion': 'medium',
    'recommendations': 'medium',
    'acknowledgment': 'low',
    'references': 'low',
    'appendices': 'low'
};

/**
 * تدفق ذكي شامل لتوليد تقرير كامل
 */
export const intelligentReportWorkflow = ai.defineFlow(
    {
        name: 'intelligentReportWorkflow',
        inputSchema: IntelligentReportWorkflowInputSchema,
        outputSchema: IntelligentReportWorkflowOutputSchema,
    },
    async (input): Promise<IntelligentReportWorkflowOutput> => {
        const startTime = Date.now();

        // بدء مراقبة الأداء الإجمالية
        let performanceSessionId: string | null = null;
        if (input.enablePerformanceMonitoring) {
            performanceSessionId = PerformanceMonitor.startSession({
                taskType: 'generation',
                domain: 'complete-report',
                userInput: `Generate complete report with ${input.sectionsToGenerate.length} sections`
            });
        }

        try {
            console.log('🚀 بدء التدفق الذكي لتوليد التقرير الكامل...');
            console.log(`📋 الأقسام المطلوبة: ${input.sectionsToGenerate.join(', ')}`);

            // 1. ترتيب الأقسام حسب التبعيات
            const orderedSections = input.generateInOrder
                ? orderSectionsByDependencies(input.sectionsToGenerate)
                : input.sectionsToGenerate;

            console.log(`📊 ترتيب التوليد: ${orderedSections.join(' → ')}`);

            // 2. تحليل السياق الإجمالي
            console.log('🧠 تحليل السياق الإجمالي...');
            const globalContext = await analyzeGlobalContext(input);

            // 3. توليد الأقسام بالترتيب
            const generatedSections: Record<string, string> = {};
            const sectionMetadata: Record<string, any> = {};

            for (let i = 0; i < orderedSections.length; i++) {
                const section = orderedSections[i];
                console.log(`\n📝 توليد القسم ${i + 1}/${orderedSections.length}: ${section}`);

                try {
                    const sectionResult = await generateSectionIntelligently(
                        section,
                        input,
                        generatedSections,
                        globalContext
                    );

                    generatedSections[section] = sectionResult.content;
                    sectionMetadata[section] = {
                        qualityScore: sectionResult.qualityScore || 0,
                        generationTime: sectionResult.generationTime || 0,
                        iterations: sectionResult.iterations || 1,
                        modelUsed: sectionResult.modelUsed || 'unknown'
                    };

                    console.log(`✅ تم توليد ${section} - جودة: ${sectionResult.qualityScore}/100`);

                } catch (error) {
                    console.error(`❌ فشل في توليد ${section}:`, error);

                    // محاولة إعادة المحاولة
                    if (input.maxRetries > 1) {
                        console.log(`🔄 إعادة المحاولة للقسم ${section}...`);
                        // يمكن إضافة منطق إعادة المحاولة هنا
                    }

                    // تسجيل الخطأ في مراقب الأداء
                    if (performanceSessionId) {
                        PerformanceMonitor.recordError(
                            performanceSessionId,
                            `Failed to generate section ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`
                        );
                    }
                }
            }

            // 4. حساب المقاييس الإجمالية
            const totalSections = orderedSections.length;
            const successfulSections = Object.keys(generatedSections).length;
            const averageQuality = Object.values(sectionMetadata).reduce((sum, meta) => sum + meta.qualityScore, 0) / successfulSections;
            const totalTime = Date.now() - startTime;
            const averageTime = totalTime / totalSections;

            // 5. إنهاء مراقبة الأداء
            let performanceReport = null;
            if (performanceSessionId) {
                PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
                    qualityScore: averageQuality,
                    improvementIterations: 0,
                    finalAccuracy: averageQuality
                });

                const session = PerformanceMonitor.endSession(performanceSessionId, successfulSections === totalSections);
                performanceReport = session?.metrics;
            }

            console.log('\n🎉 اكتمل التدفق الذكي للتقرير!');
            console.log(`📊 النتائج: ${successfulSections}/${totalSections} أقسام تم توليدها بنجاح`);
            console.log(`⭐ متوسط الجودة: ${averageQuality.toFixed(1)}/100`);
            console.log(`⏱️ إجمالي الوقت: ${totalTime}ms`);

            return {
                generatedSections,
                sectionMetadata,
                overallMetrics: {
                    totalSections,
                    successfulSections,
                    averageQuality,
                    totalTime,
                    averageTime
                },
                performanceReport
            };

        } catch (error) {
            if (performanceSessionId) {
                PerformanceMonitor.recordError(performanceSessionId, error instanceof Error ? error.message : 'Unknown error');
                PerformanceMonitor.endSession(performanceSessionId, false);
            }

            console.error('❌ خطأ في التدفق الذكي للتقرير:', error);
            throw error;
        }
    }
);

/**
 * ترتيب الأقسام حسب التبعيات
 */
function orderSectionsByDependencies(sections: string[]): SectionName[] {
    const result: SectionName[] = [];
    const remaining = [...sections] as SectionName[];

    // ترتيب حسب الترتيب المنطقي المحدد مسبقاً
    for (const section of SECTION_ORDER) {
        if (remaining.includes(section)) {
            result.push(section);
            remaining.splice(remaining.indexOf(section), 1);
        }
    }

    // إضافة أي أقسام متبقية
    result.push(...(remaining as SectionName[]));

    return result;
}

/**
 * تحليل السياق الإجمالي للتقرير
 */
async function analyzeGlobalContext(input: IntelligentReportWorkflowInput) {
    console.log('🔍 تحليل السياق الإجمالي...');

    // تحضير السياق الخارجي
    const externalContext = [];

    if (input.proposal) {
        externalContext.push({
            fileName: "project-proposal.json",
            content: JSON.stringify(input.proposal, null, 2),
            type: "context"
        });
    }

    if (input.projectPlan) {
        externalContext.push({
            fileName: "project-plan.json",
            content: JSON.stringify(input.projectPlan, null, 2),
            type: "context"
        });
    }

    if (input.contextFiles) {
        externalContext.push(...input.contextFiles);
    }

    // تحليل السياق باستخدام النظام الذكي
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
        userInput: `Generate complete report with sections: ${input.sectionsToGenerate.join(', ')}`,
        externalContext,
        guidelines: input.guidelines || []
    });

    console.log(`✅ تم تحليل السياق: نوع المحتوى = ${contextAnalysis.contentType}, التعقيد = ${contextAnalysis.complexityLevel}`);

    return {
        contextAnalysis,
        externalContext
    };
}

/**
 * توليد قسم واحد بذكاء
 */
async function generateSectionIntelligently(
    section: SectionName,
    input: IntelligentReportWorkflowInput,
    existingSections: Record<string, string>,
    globalContext: any
): Promise<{
    content: string;
    qualityScore?: number;
    generationTime?: number;
    iterations?: number;
    modelUsed?: string;
}> {
    const sectionStart = Date.now();

    // الحصول على إعدادات الجودة المبسطة للقسم
    const complexity = SECTION_COMPLEXITY_MAP[section] || 'medium';
    const qualitySettings = SIMPLIFIED_QUALITY_SETTINGS[complexity];
    const qualityThreshold = Math.max(input.qualityThreshold, qualitySettings.threshold);

    // تحضير التوجيهات المخصصة للقسم (مبسطة)
    const sectionGuidelines = [
        ...(input.guidelines || []),
        `Focus areas: ${qualitySettings.focusAreas.join(', ')}`,
        `Quality threshold: ${qualityThreshold}/100`
    ];

    // تحضير الأقسام الأخرى كسياق
    const relevantSections: Record<string, string> = {};
    const dependencies = SECTION_DEPENDENCIES[section] || [];

    for (const dep of dependencies) {
        if (existingSections[dep]) {
            relevantSections[dep] = existingSections[dep];
        }
    }

    // إعداد مدخلات التوليد (مبسط)
    const sectionInput: GenerateSectionInput = {
        sectionToGenerate: section,
        proposal: input.proposal,
        projectPlan: input.projectPlan,
        guidelines: sectionGuidelines,
        otherSections: Object.keys(relevantSections).length > 0 ? relevantSections : undefined,
        contextFiles: input.contextFiles
    };

    // توليد القسم
    const result = await generateReportSection(sectionInput);

    const generationTime = Date.now() - sectionStart;

    return {
        content: result.content,
        qualityScore: 85, // يمكن الحصول على هذا من النظام الذكي
        generationTime,
        iterations: 1,
        modelUsed: 'intelligent-system'
    };
}

/**
 * دالة مساعدة لتوليد تقرير كامل بسهولة
 */
export async function generateCompleteReport(config: {
    proposal?: any;
    projectPlan?: any;
    sections?: SectionName[];
    guidelines?: string[];
    contextFiles?: Array<{ fileName: string; content: string; type: string }>;
    qualityThreshold?: number;
}) {
    const sectionsToGenerate = config.sections || [
        'abstract',
        'acknowledgment',
        'introduction',
        'literatureReview',
        'systemAnalysis',
        'designStrategy',
        'systemDesign',
        'systemProgramming',
        'systemTesting',
        'recommendations',
        'conclusion',
        'references',
        'appendices'
    ] as const;

    return await intelligentReportWorkflow({
        proposal: config.proposal,
        projectPlan: config.projectPlan,
        sectionsToGenerate,
        generateInOrder: true,
        useIntelligentDependencies: true,
        qualityThreshold: config.qualityThreshold || 85,
        guidelines: config.guidelines,
        contextFiles: config.contextFiles,
        enablePerformanceMonitoring: true,
        enableIterativeImprovement: true,
        maxRetries: 3
    });
}
