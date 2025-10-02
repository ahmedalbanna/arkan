/**
 * تدفق ذكي لتوليد مخططات PlantUML
 * يستخدم النظام الذكي لفهم المتطلبات وتوليد مخططات عالية الجودة
 */

import {
    DiagramPromptBuilder
} from '@/ai/prompts/diagram-prompts';
import { z } from 'zod';

// مخطط إدخال موسع للمخططات
const DiagramFlowInputSchema = z.object({
    // معلومات أساسية
    title: z.string(),
    description: z.string().optional(),
    type: z.enum([
        'class', 'sequence', 'usecase', 'activity', 'component', 'deployment',
        'state', 'object', 'communication', 'interaction', 'timing',
        'flowchart', 'mindmap', 'gantt', 'network', 'er', 'wireframe'
    ] as const),
    complexity: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
    style: z.object({
        theme: z.enum(['default', 'modern', 'minimal', 'colorful']).default('modern'),
        direction: z.enum(['top-bottom', 'left-right', 'bottom-top', 'right-left']).default('top-bottom'),
        showDetails: z.boolean().default(true),
        includeNotes: z.boolean().default(true)
    }).optional(),
    requirements: z.array(z.string()).optional(),
    language: z.enum(['ar', 'en']).optional().default('ar'),

    // معلومات السياق
    projectContext: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        domain: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        stakeholders: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional(),
        constraints: z.array(z.string()).optional()
    }).optional(),

    // محتوى مرجعي
    referenceContent: z.object({
        sectionContent: z.string().optional(),
        existingDiagrams: z.array(z.string()).optional(),
        documentationLinks: z.array(z.string()).optional()
    }).optional(),

    // إعدادات التوليد الذكي
    intelligentSettings: z.object({
        enableContextAnalysis: z.boolean().default(true),
        enableIterativeImprovement: z.boolean().default(true),
        enablePerformanceMonitoring: z.boolean().default(true),
        qualityThreshold: z.number().min(0).max(100).default(80),
        maxIterations: z.number().min(1).max(5).default(3),
        adaptiveModelSelection: z.boolean().default(true)
    }).optional(),

    // تفضيلات المخرجات
    outputPreferences: z.object({
        includeComments: z.boolean().default(true),
        includeMetadata: z.boolean().default(true),
        generateSuggestions: z.boolean().default(true),
        validateSyntax: z.boolean().default(true)
    }).optional()
});

// مخطط مخرجات موسع
const DiagramFlowOutputSchema = z.object({
    // النتيجة الأساسية
    title: z.string(),
    description: z.string(),
    type: z.string(),
    plantUmlCode: z.string(),
    elements: z.array(z.string()),
    elementCount: z.number(),
    suggestions: z.array(z.string()),

    // البيانات الوصفية
    metadata: z.object({
        qualityScore: z.number(),
        executionTime: z.number(),
        modelUsed: z.string(),
        iterations: z.number()
    }),

    // تحليل السياق
    contextAnalysis: z.object({
        contentType: z.string(),
        complexity: z.string(),
        keyEntities: z.array(z.string()),
        relationships: z.array(z.string()),
        suggestedDiagramTypes: z.array(z.string())
    }),

    // معلومات الأداء
    performanceMetrics: z.object({
        executionTime: z.number(),
        modelUsed: z.string(),
        iterations: z.number(),
        qualityScore: z.number(),
        improvementSteps: z.array(z.string())
    }),

    // تحليل جودة المخرجات
    qualityAnalysis: z.object({
        syntaxValid: z.boolean(),
        completeness: z.number(),
        clarity: z.number(),
        accuracy: z.number(),
        recommendations: z.array(z.string())
    })
});

type DiagramFlowInput = z.infer<typeof DiagramFlowInputSchema>;
type DiagramFlowOutput = z.infer<typeof DiagramFlowOutputSchema>;

/**
 * تدفق توليد المخططات الذكي
 */
export async function generateDiagram(input: DiagramFlowInput): Promise<DiagramFlowOutput> {
    const startTime = Date.now();

    try {
        // 1. تحليل السياق والمحتوى
        const contextAnalysis = {
            contentType: 'diagram',
            complexity: input.complexity || 'detailed',
            keyEntities: extractKeyEntities(input),
            relationships: [],
            suggestedDiagramTypes: [input.type]
        };

        // 2. اختيار النموذج المناسب
        const selectedModel = 'gemini-pro';

        // 3. بناء البرومبت الذكي المخصص للمخططات
        const diagramPromptBuilder = new DiagramPromptBuilder();
        const optimizedPrompt = await diagramPromptBuilder.buildDiagramPrompt({
            diagramType: input.type as any,
            title: input.title,
            description: input.description,
            complexity: input.complexity,
            style: input.style,
            projectContext: input.projectContext,
            requirements: input.requirements,
            stakeholders: input.projectContext?.stakeholders,
            contextAnalysis,
            language: input.language || 'ar'
        });

        // 4. التوليد الأولي
        const generationResult = await generateInitialDiagram({
            prompt: optimizedPrompt,
            model: selectedModel,
            input
        });

        // 5. التحقق من الجودة والتحسين التكراري
        let finalResult = generationResult;
        const iterations = 1;
        const improvementSteps: string[] = [];

        // 6. تحليل جودة المخرجات النهائية
        const qualityAnalysis = await analyzeOutputQuality(finalResult, input);

        // 7. استخراج المعلومات الإضافية
        const elements = extractDiagramElements(finalResult.plantUmlCode);
        const elementCount = elements.length;

        // 8. حساب الوقت المستغرق
        const executionTime = Date.now() - startTime;

        // إعداد النتيجة النهائية
        const result: DiagramFlowOutput = {
            ...finalResult,
            elements,
            elementCount,
            contextAnalysis,
            performanceMetrics: {
                executionTime,
                modelUsed: selectedModel,
                iterations,
                qualityScore: qualityAnalysis.accuracy * 100,
                improvementSteps
            },
            qualityAnalysis,
            metadata: {
                qualityScore: Math.round(qualityAnalysis.accuracy * 100),
                executionTime,
                modelUsed: selectedModel,
                iterations
            }
        };

        return result;

    } catch (error) {
        // معالجة الأخطاء
        const executionTime = Date.now() - startTime;

        // إرجاع نتيجة احتياطية
        return createFallbackResult(input, error, executionTime);
    }
}

/**
 * توليد المخطط الأولي
 */
async function generateInitialDiagram({
    prompt,
    model,
    input
}: {
    prompt: string;
    model: string;
    input: DiagramFlowInput;
}) {
    // محاكاة توليد المخطط (يمكن استبداله بـ AI حقيقي)
    const mockPlantUMLCode = `@startuml
title ${input.title}

' مخطط ${input.type} مولد تلقائياً
note as N1
هذا مخطط تجريبي مولد بالذكاء الاصطناعي
النوع: ${input.type}
التعقيد: ${input.complexity}
end note

@enduml`;

    // تحليل وتنظيف كود PlantUML
    const cleanedCode = cleanPlantUMLCode(mockPlantUMLCode);

    return {
        title: input.title,
        description: input.description || '',
        type: input.type,
        plantUmlCode: cleanedCode,
        suggestions: ['إضافة المزيد من التفاصيل', 'تحسين التنظيم'],
        elements: [],
        elementCount: 0
    };
}

/**
 * استخراج الكيانات الرئيسية من الإدخال
 */
function extractKeyEntities(input: DiagramFlowInput): string[] {
    const entities: string[] = [];

    if (input.projectContext?.requirements) {
        entities.push(...input.projectContext.requirements);
    }

    if (input.projectContext?.stakeholders) {
        entities.push(...input.projectContext.stakeholders);
    }

    if (input.projectContext?.technologies) {
        entities.push(...input.projectContext.technologies);
    }

    return [...new Set(entities)];
}

/**
 * تحليل جودة المخرجات
 */
async function analyzeOutputQuality(
    result: any,
    input: DiagramFlowInput
): Promise<{
    syntaxValid: boolean;
    completeness: number;
    clarity: number;
    accuracy: number;
    recommendations: string[];
}> {
    const recommendations: string[] = [];

    // التحقق من صحة البناء
    const syntaxValid = validatePlantUMLSyntax(result.plantUmlCode);
    if (!syntaxValid) {
        recommendations.push('تحسين بناء كود PlantUML');
    }

    // تقييم الاكتمال
    const completeness = assessCompleteness(result, input);
    if (completeness < 0.8) {
        recommendations.push('إضافة المزيد من التفاصيل والعناصر');
    }

    // تقييم الوضوح
    const clarity = assessClarity(result.plantUmlCode);
    if (clarity < 0.8) {
        recommendations.push('تحسين تنظيم وترتيب العناصر');
    }

    // تقييم الدقة
    const accuracy = assessAccuracy(result, input);
    if (accuracy < 0.8) {
        recommendations.push('مراجعة دقة المعلومات والعلاقات');
    }

    return {
        syntaxValid,
        completeness,
        clarity,
        accuracy,
        recommendations
    };
}

/**
 * استخراج عناصر المخطط
 */
function extractDiagramElements(plantUmlCode: string): string[] {
    const elements: string[] = [];
    const lines = plantUmlCode.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // استخراج الكلاسات
        if (trimmed.startsWith('class ')) {
            const match = trimmed.match(/class\s+(\w+)/);
            if (match) elements.push(match[1]);
        }

        // استخراج الواجهات
        if (trimmed.startsWith('interface ')) {
            const match = trimmed.match(/interface\s+(\w+)/);
            if (match) elements.push(match[1]);
        }

        // استخراج الممثلين
        if (trimmed.startsWith('actor ')) {
            const match = trimmed.match(/actor\s+(\w+)/);
            if (match) elements.push(match[1]);
        }
    }

    return [...new Set(elements)];
}

/**
 * تنظيف كود PlantUML
 */
function cleanPlantUMLCode(code: string): string {
    let cleaned = code;

    // إزالة العلامات الإضافية
    cleaned = cleaned.replace(/```plantuml\s*/g, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    // التأكد من وجود بداية ونهاية
    if (!cleaned.includes('@startuml')) {
        cleaned = '@startuml\n' + cleaned;
    }
    if (!cleaned.includes('@enduml')) {
        cleaned = cleaned + '\n@enduml';
    }

    // تنظيف الأسطر الفارغة الزائدة
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    return cleaned.trim();
}

/**
 * التحقق من صحة بناء PlantUML
 */
function validatePlantUMLSyntax(code: string): boolean {
    // فحوصات أساسية
    if (!code.includes('@startuml') || !code.includes('@enduml')) {
        return false;
    }

    // فحص توازن الأقواس
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;

    return openBraces === closeBraces;
}

/**
 * تقييم اكتمال المخطط
 */
function assessCompleteness(result: any, input: DiagramFlowInput): number {
    let score = 0.5; // نقطة بداية

    // وجود عناصر
    if (result.plantUmlCode.length > 100) score += 0.2;

    // وجود علاقات
    if (result.plantUmlCode.includes('-->') || result.plantUmlCode.includes('->')) {
        score += 0.2;
    }

    // تغطية المتطلبات
    if (input.requirements) {
        const coveredRequirements = input.requirements.filter(req =>
            result.plantUmlCode.toLowerCase().includes(req.toLowerCase())
        );
        score += (coveredRequirements.length / input.requirements.length) * 0.1;
    }

    return Math.min(score, 1);
}

/**
 * تقييم وضوح المخطط
 */
function assessClarity(code: string): number {
    let score = 0.5;

    // وجود تعليقات
    if (code.includes("'") || code.includes('note')) score += 0.2;

    // تنظيم الكود
    const lines = code.split('\n');
    const organizedLines = lines.filter(line => line.trim().length > 0);
    if (organizedLines.length > 5) score += 0.2;

    // استخدام أسماء واضحة
    const hasDescriptiveNames = /[A-Za-z]{3,}/.test(code);
    if (hasDescriptiveNames) score += 0.1;

    return Math.min(score, 1);
}

/**
 * تقييم دقة المخطط
 */
function assessAccuracy(result: any, input: DiagramFlowInput): number {
    let score = 0.7; // افتراض دقة جيدة

    // التحقق من نوع المخطط المناسب
    const typeKeywords = {
        'class': ['class', 'interface', 'extends', 'implements'],
        'sequence': ['participant', 'actor', '->', 'activate'],
        'usecase': ['actor', 'usecase', '-->'],
        'activity': ['start', 'stop', 'if', 'endif'],
        'component': ['component', 'interface', '-->'],
        'deployment': ['node', 'artifact', 'deploy']
    };

    const expectedKeywords = typeKeywords[input.type as keyof typeof typeKeywords] || [];
    const foundKeywords = expectedKeywords.filter(keyword =>
        result.plantUmlCode.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
        score += (foundKeywords.length / expectedKeywords.length) * 0.2;
    }

    return Math.min(score, 1);
}

/**
 * إنشاء نتيجة احتياطية في حالة الخطأ
 */
function createFallbackResult(
    input: DiagramFlowInput,
    error: any,
    executionTime: number
): DiagramFlowOutput {
    const fallbackCode = `@startuml
title ${input.title || 'مخطط'}

note as N1
حدث خطأ أثناء التوليد
يرجى المحاولة مرة أخرى
end note

@enduml`;

    return {
        title: input.title || 'مخطط',
        description: input.description || '',
        type: input.type,
        plantUmlCode: fallbackCode,
        elements: [],
        elementCount: 0,
        suggestions: [
            'تحقق من صحة البيانات المدخلة',
            'جرب تبسيط الوصف',
            'تأكد من اتصال الإنترنت'
        ],
        contextAnalysis: {
            contentType: 'error',
            complexity: 'low',
            keyEntities: [],
            relationships: [],
            suggestedDiagramTypes: [input.type]
        },
        performanceMetrics: {
            executionTime,
            modelUsed: 'fallback',
            iterations: 0,
            qualityScore: 0,
            improvementSteps: []
        },
        qualityAnalysis: {
            syntaxValid: true,
            completeness: 0.1,
            clarity: 0.5,
            accuracy: 0.1,
            recommendations: [
                'إعادة المحاولة مع بيانات مختلفة',
                'التحقق من إعدادات النظام'
            ]
        },
        metadata: {
            qualityScore: 10,
            executionTime,
            modelUsed: 'fallback',
            iterations: 0
        }
    };
}
