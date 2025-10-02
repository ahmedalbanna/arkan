/**
 * خدمة ذكية لتوليد مخططات PlantUML متقدمة
 * تدعم أنواع مختلفة من المخططات مع الذكاء الاصطناعي
 */

import type { SectionName } from '@/ai/schemas/enums';
import { apiClient } from '@/services/shared/api-client';

// أنواع المخططات المدعومة
export type DiagramType =
    | 'class'           // مخطط الفئات
    | 'sequence'        // مخطط التسلسل
    | 'usecase'         // مخطط حالات الاستخدام
    | 'activity'        // مخطط الأنشطة
    | 'component'       // مخطط المكونات
    | 'deployment'      // مخطط النشر
    | 'state'           // مخطط الحالات
    | 'object'          // مخطط الكائنات
    | 'package'         // مخطط الحزم
    | 'timing'          // مخطط التوقيت
    | 'network'         // مخطط الشبكة
    | 'mindmap'         // خريطة ذهنية
    | 'gantt'           // مخطط جانت
    | 'flowchart'       // مخطط تدفق
    | 'er'              // مخطط العلاقات
    | 'architecture';   // مخطط المعمارية

// معلومات أنواع المخططات
export const DIAGRAM_TYPES: Record<DiagramType, {
    title: string;
    description: string;
    icon: string;
    category: 'uml' | 'business' | 'technical' | 'planning';
    complexity: 'simple' | 'medium' | 'complex';
    estimatedTime: number;
    useCases: string[];
    sectionRelevance: SectionName[];
}> = {
    'class': {
        title: 'مخطط الفئات',
        description: 'يوضح هيكل الفئات والعلاقات بينها في النظام',
        icon: '🏗️',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 3000,
        useCases: ['تصميم النظام', 'هندسة البرمجيات', 'التوثيق التقني'],
        sectionRelevance: ['systemDesign', 'systemProgramming', 'designStrategy']
    },
    'sequence': {
        title: 'مخطط التسلسل',
        description: 'يوضح تفاعل الكائنات عبر الزمن في سيناريو محدد',
        icon: '🔄',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 2500,
        useCases: ['تحليل العمليات', 'توثيق التفاعلات', 'تصميم APIs'],
        sectionRelevance: ['systemAnalysis', 'systemDesign', 'systemProgramming']
    },
    'usecase': {
        title: 'مخطط حالات الاستخدام',
        description: 'يوضح وظائف النظام من منظور المستخدمين',
        icon: '👤',
        category: 'uml',
        complexity: 'simple',
        estimatedTime: 2000,
        useCases: ['تحليل المتطلبات', 'تصميم النظام', 'التخطيط'],
        sectionRelevance: ['systemAnalysis', 'introduction', 'designStrategy']
    },
    'activity': {
        title: 'مخطط الأنشطة',
        description: 'يوضح تدفق العمليات والأنشطة في النظام',
        icon: '⚡',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 2800,
        useCases: ['تحليل العمليات', 'تحسين الأداء', 'توثيق الإجراءات'],
        sectionRelevance: ['systemAnalysis', 'systemDesign', 'systemTesting']
    },
    'component': {
        title: 'مخطط المكونات',
        description: 'يوضح هيكل المكونات والتبعيات في النظام',
        icon: '🧩',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 3200,
        useCases: ['هندسة البرمجيات', 'تصميم المعمارية', 'إدارة التبعيات'],
        sectionRelevance: ['systemDesign', 'systemProgramming', 'designStrategy']
    },
    'deployment': {
        title: 'مخطط النشر',
        description: 'يوضح كيفية نشر النظام على البنية التحتية',
        icon: '🚀',
        category: 'technical',
        complexity: 'complex',
        estimatedTime: 3500,
        useCases: ['تخطيط النشر', 'إدارة البنية التحتية', 'DevOps'],
        sectionRelevance: ['systemDesign', 'systemProgramming', 'systemTesting']
    },
    'state': {
        title: 'مخطط الحالات',
        description: 'يوضح حالات الكائن والانتقالات بينها',
        icon: '🔀',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 2700,
        useCases: ['تصميم السلوك', 'تحليل النظام', 'التحكم في التدفق'],
        sectionRelevance: ['systemDesign', 'systemAnalysis', 'systemProgramming']
    },
    'object': {
        title: 'مخطط الكائنات',
        description: 'يوضح الكائنات والعلاقات بينها في لحظة زمنية محددة',
        icon: '📦',
        category: 'uml',
        complexity: 'simple',
        estimatedTime: 2200,
        useCases: ['توثيق البيانات', 'تحليل الهيكل', 'التصميم التفصيلي'],
        sectionRelevance: ['systemDesign', 'systemProgramming']
    },
    'package': {
        title: 'مخطط الحزم',
        description: 'يوضح تنظيم الحزم والتبعيات بينها',
        icon: '📁',
        category: 'uml',
        complexity: 'medium',
        estimatedTime: 2600,
        useCases: ['تنظيم الكود', 'إدارة المشروع', 'هندسة البرمجيات'],
        sectionRelevance: ['systemDesign', 'systemProgramming', 'designStrategy']
    },
    'timing': {
        title: 'مخطط التوقيت',
        description: 'يوضح تغيير حالات الكائنات عبر الزمن',
        icon: '⏱️',
        category: 'uml',
        complexity: 'complex',
        estimatedTime: 3800,
        useCases: ['تحليل الأداء', 'تصميم الأنظمة الزمنية', 'التحكم في الوقت'],
        sectionRelevance: ['systemDesign', 'systemTesting', 'systemAnalysis']
    },
    'network': {
        title: 'مخطط الشبكة',
        description: 'يوضح هيكل الشبكة والاتصالات',
        icon: '🌐',
        category: 'technical',
        complexity: 'complex',
        estimatedTime: 4000,
        useCases: ['تصميم الشبكة', 'أمن المعلومات', 'البنية التحتية'],
        sectionRelevance: ['systemDesign', 'systemAnalysis', 'designStrategy']
    },
    'mindmap': {
        title: 'خريطة ذهنية',
        description: 'يوضح الأفكار والمفاهيم بشكل هرمي ومترابط',
        icon: '🧠',
        category: 'business',
        complexity: 'simple',
        estimatedTime: 1800,
        useCases: ['العصف الذهني', 'تنظيم الأفكار', 'التخطيط الاستراتيجي'],
        sectionRelevance: ['introduction', 'designStrategy', 'systemAnalysis']
    },
    'gantt': {
        title: 'مخطط جانت',
        description: 'يوضح الجدول الزمني للمشروع والمهام',
        icon: '📊',
        category: 'planning',
        complexity: 'medium',
        estimatedTime: 3000,
        useCases: ['إدارة المشاريع', 'التخطيط الزمني', 'متابعة التقدم'],
        sectionRelevance: ['systemAnalysis', 'designStrategy', 'systemTesting']
    },
    'flowchart': {
        title: 'مخطط تدفق',
        description: 'يوضح تدفق العمليات والقرارات',
        icon: '🔀',
        category: 'business',
        complexity: 'simple',
        estimatedTime: 2000,
        useCases: ['توثيق العمليات', 'تحليل الإجراءات', 'تحسين التدفق'],
        sectionRelevance: ['systemAnalysis', 'systemDesign', 'systemTesting']
    },
    'er': {
        title: 'مخطط العلاقات',
        description: 'يوضح هيكل قاعدة البيانات والعلاقات',
        icon: '🗄️',
        category: 'technical',
        complexity: 'medium',
        estimatedTime: 3200,
        useCases: ['تصميم قاعدة البيانات', 'نمذجة البيانات', 'التحليل'],
        sectionRelevance: ['systemDesign', 'systemProgramming', 'systemAnalysis']
    },
    'architecture': {
        title: 'مخطط المعمارية',
        description: 'يوضح المعمارية العامة للنظام والمكونات الرئيسية',
        icon: '🏛️',
        category: 'technical',
        complexity: 'complex',
        estimatedTime: 4500,
        useCases: ['تصميم المعمارية', 'التخطيط التقني', 'التوثيق المعماري'],
        sectionRelevance: ['systemDesign', 'designStrategy', 'systemAnalysis']
    }
};

// إعدادات توليد المخطط
export interface DiagramGenerationConfig {
    type: DiagramType;
    title?: string;
    description?: string;
    context: {
        projectData?: any;
        sectionContent?: string;
        requirements?: string[];
        stakeholders?: string[];
        technologies?: string[];
    };
    style: {
        theme: 'default' | 'modern' | 'minimal' | 'colorful';
        direction: 'top-bottom' | 'left-right' | 'bottom-top' | 'right-left';
        showDetails: boolean;
        includeNotes: boolean;
    };
    complexity: 'basic' | 'detailed' | 'comprehensive';
    language: 'ar' | 'en';
}

// نتيجة توليد المخطط
export interface DiagramResult {
    id: string;
    type: DiagramType;
    title: string;
    plantUmlCode: string;
    svgUrl?: string;
    pngUrl?: string;
    metadata: {
        generatedAt: string;
        estimatedComplexity: string;
        elementCount: number;
        generationTime: number;
        qualityScore: number;
    };
    suggestions: string[];
    relatedDiagrams: DiagramType[];
}

// إحصائيات المخططات
export interface DiagramStats {
    totalGenerated: number;
    byType: Record<DiagramType, number>;
    averageQuality: number;
    averageGenerationTime: number;
    mostUsedTypes: DiagramType[];
    recentDiagrams: DiagramResult[];
}

/**
 * خدمة المخططات الذكية الرئيسية
 */
export class IntelligentDiagramService {

    /**
     * توليد مخطط PlantUML ذكي
     */
    static async generateDiagram(config: DiagramGenerationConfig): Promise<DiagramResult> {
        const startTime = Date.now();

        try {
            // إعداد البيانات للإرسال
            const requestData = {
                diagramType: config.type,
                title: config.title || DIAGRAM_TYPES[config.type].title,
                description: config.description || DIAGRAM_TYPES[config.type].description,
                context: config.context,
                style: config.style,
                complexity: config.complexity,
                language: config.language || 'ar'
            };

            // إرسال الطلب للـ API
            const response = await apiClient.post<DiagramResult>('/api/generate/diagram', requestData);

            const executionTime = Date.now() - startTime;

            // إضافة معلومات الأداء
            response.metadata = {
                ...response.metadata,
                generationTime: executionTime
            };

            return response;

        } catch (error) {
            throw new Error(`فشل في توليد المخطط: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
    }

    /**
     * توليد مخططات متعددة لقسم معين
     */
    static async generateSectionDiagrams(
        sectionName: SectionName,
        sectionContent: string,
        projectData?: any
    ): Promise<DiagramResult[]> {
        const relevantTypes = this.getRelevantDiagramTypes(sectionName);
        const diagrams: DiagramResult[] = [];

        for (const type of relevantTypes) {
            try {
                const config: DiagramGenerationConfig = {
                    type,
                    context: {
                        projectData,
                        sectionContent,
                        requirements: projectData?.objectives || [],
                        stakeholders: projectData?.stakeholders || [],
                        technologies: projectData?.technologies || []
                    },
                    style: {
                        theme: 'modern',
                        direction: 'top-bottom',
                        showDetails: true,
                        includeNotes: true
                    },
                    complexity: 'detailed',
                    language: 'ar'
                };

                const diagram = await this.generateDiagram(config);
                diagrams.push(diagram);

            } catch (error) {
                console.warn(`فشل في توليد مخطط ${type} للقسم ${sectionName}:`, error);
            }
        }

        return diagrams;
    }

    /**
     * الحصول على أنواع المخططات المناسبة لقسم معين
     */
    static getRelevantDiagramTypes(sectionName: SectionName): DiagramType[] {
        const relevantTypes: DiagramType[] = [];

        Object.entries(DIAGRAM_TYPES).forEach(([type, info]) => {
            if (info.sectionRelevance.includes(sectionName)) {
                relevantTypes.push(type as DiagramType);
            }
        });

        // ترتيب حسب الأولوية والتعقيد
        return relevantTypes.sort((a, b) => {
            const aInfo = DIAGRAM_TYPES[a];
            const bInfo = DIAGRAM_TYPES[b];

            // أولوية للمخططات البسيطة والمتوسطة
            const complexityOrder = { 'simple': 1, 'medium': 2, 'complex': 3 };
            return complexityOrder[aInfo.complexity] - complexityOrder[bInfo.complexity];
        });
    }

    /**
     * تحويل PlantUML إلى صورة
     */
    static async renderDiagram(
        plantUmlCode: string,
        format: 'svg' | 'png' | 'pdf' = 'svg'
    ): Promise<string> {
        try {
            const response = await apiClient.post<{ url: string }>('/api/diagram/render', {
                plantUmlCode,
                format
            });

            return response.url;
        } catch (error) {
            throw new Error(`فشل في تحويل المخطط: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
    }

    /**
     * تحسين مخطط PlantUML موجود
     */
    static async optimizeDiagram(
        plantUmlCode: string,
        optimizationType: 'readability' | 'performance' | 'aesthetics' | 'completeness'
    ): Promise<{ optimizedCode: string; improvements: string[] }> {
        try {
            const response = await apiClient.post<{ optimizedCode: string; improvements: string[] }>(
                '/api/diagram/optimize',
                {
                    plantUmlCode,
                    optimizationType
                }
            );

            return response;
        } catch (error) {
            throw new Error(`فشل في تحسين المخطط: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
    }

    /**
     * تحليل جودة المخطط
     */
    static analyzeDiagramQuality(plantUmlCode: string): {
        score: number;
        issues: string[];
        suggestions: string[];
        complexity: 'low' | 'medium' | 'high';
    } {
        const issues: string[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // تحليل أساسي للكود
        const lines = plantUmlCode.split('\n').filter(line => line.trim());
        const elementCount = lines.filter(line =>
            line.includes('class ') ||
            line.includes('actor ') ||
            line.includes('usecase ') ||
            line.includes('component ')
        ).length;

        // تقييم التعقيد
        let complexity: 'low' | 'medium' | 'high' = 'low';
        if (elementCount > 20) complexity = 'high';
        else if (elementCount > 10) complexity = 'medium';

        // فحص الجودة
        if (!plantUmlCode.includes('@startuml')) {
            issues.push('المخطط لا يحتوي على بداية صحيحة');
            score -= 20;
        }

        if (!plantUmlCode.includes('@enduml')) {
            issues.push('المخطط لا يحتوي على نهاية صحيحة');
            score -= 20;
        }

        if (elementCount < 3) {
            issues.push('المخطط يحتوي على عناصر قليلة جداً');
            score -= 15;
        }

        if (lines.length > 100) {
            suggestions.push('يمكن تقسيم المخطط إلى مخططات أصغر');
        }

        if (!plantUmlCode.includes('note ') && complexity !== 'low') {
            suggestions.push('إضافة ملاحظات توضيحية يحسن من فهم المخطط');
        }

        return {
            score: Math.max(0, score),
            issues,
            suggestions,
            complexity
        };
    }

    /**
     * الحصول على إحصائيات المخططات
     */
    static async getDiagramStats(): Promise<DiagramStats> {
        try {
            const response = await apiClient.get<DiagramStats>('/api/diagram/stats');
            return response;
        } catch (error) {
            // إرجاع بيانات افتراضية في حالة الخطأ
            return {
                totalGenerated: 0,
                byType: {} as Record<DiagramType, number>,
                averageQuality: 0,
                averageGenerationTime: 0,
                mostUsedTypes: [],
                recentDiagrams: []
            };
        }
    }

    /**
     * اقتراح مخططات للمشروع
     */
    static suggestDiagramsForProject(projectData: any): {
        recommended: DiagramType[];
        optional: DiagramType[];
        reasoning: Record<DiagramType, string>;
    } {
        const recommended: DiagramType[] = [];
        const optional: DiagramType[] = [];
        const reasoning: Record<DiagramType, string> = {};

        // تحليل نوع المشروع
        const isWebApp = projectData?.technologies?.some((tech: string) =>
            tech.toLowerCase().includes('web') ||
            tech.toLowerCase().includes('react') ||
            tech.toLowerCase().includes('angular')
        );

        const isMobileApp = projectData?.technologies?.some((tech: string) =>
            tech.toLowerCase().includes('mobile') ||
            tech.toLowerCase().includes('android') ||
            tech.toLowerCase().includes('ios')
        );

        const hasDatabase = projectData?.technologies?.some((tech: string) =>
            tech.toLowerCase().includes('database') ||
            tech.toLowerCase().includes('sql') ||
            tech.toLowerCase().includes('mongodb')
        );

        // اقتراحات أساسية لجميع المشاريع
        recommended.push('usecase');
        reasoning['usecase'] = 'ضروري لفهم متطلبات النظام ووظائفه';

        recommended.push('architecture');
        reasoning['architecture'] = 'يوضح المعمارية العامة للنظام';

        recommended.push('flowchart');
        reasoning['flowchart'] = 'يساعد في توضيح تدفق العمليات الأساسية';

        // اقتراحات حسب نوع المشروع
        if (isWebApp || isMobileApp) {
            recommended.push('component');
            reasoning['component'] = 'مهم لتطبيقات الويب والجوال لتوضيح هيكل المكونات';

            recommended.push('sequence');
            reasoning['sequence'] = 'يوضح تفاعل المستخدم مع النظام';

            optional.push('deployment');
            reasoning['deployment'] = 'مفيد لتخطيط نشر التطبيق';
        }

        if (hasDatabase) {
            recommended.push('er');
            reasoning['er'] = 'ضروري لتوضيح هيكل قاعدة البيانات';

            optional.push('class');
            reasoning['class'] = 'يساعد في تصميم نماذج البيانات';
        }

        // اقتراحات إضافية
        optional.push('gantt');
        reasoning['gantt'] = 'مفيد لإدارة الجدول الزمني للمشروع';

        optional.push('mindmap');
        reasoning['mindmap'] = 'يساعد في تنظيم الأفكار والمفاهيم';

        return { recommended, optional, reasoning };
    }

    /**
     * تصدير المخطط بصيغ مختلفة
     */
    static async exportDiagram(
        diagramId: string,
        format: 'plantuml' | 'svg' | 'png' | 'pdf'
    ): Promise<Blob> {
        try {
            const response = await fetch(`/api/diagram/export/${diagramId}?format=${format}`);

            if (!response.ok) {
                throw new Error('فشل في تصدير المخطط');
            }

            return await response.blob();
        } catch (error) {
            throw new Error(`فشل في تصدير المخطط: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
    }
}

/**
 * دوال مساعدة للمخططات
 */
export const DiagramUtils = {
    /**
     * الحصول على معلومات نوع المخطط
     */
    getDiagramTypeInfo(type: DiagramType) {
        return DIAGRAM_TYPES[type];
    },

    /**
     * الحصول على جميع أنواع المخططات
     */
    getAllDiagramTypes(): DiagramType[] {
        return Object.keys(DIAGRAM_TYPES) as DiagramType[];
    },

    /**
     * تصفية المخططات حسب الفئة
     */
    getDiagramsByCategory(category: 'uml' | 'business' | 'technical' | 'planning'): DiagramType[] {
        return Object.entries(DIAGRAM_TYPES)
            .filter(([_, info]) => info.category === category)
            .map(([type]) => type as DiagramType);
    },

    /**
     * تنسيق وقت التوليد المتوقع
     */
    formatEstimatedTime(milliseconds: number): string {
        const seconds = Math.ceil(milliseconds / 1000);
        if (seconds < 60) return `${seconds} ثانية`;
        const minutes = Math.ceil(seconds / 60);
        return `${minutes} دقيقة`;
    },

    /**
     * تحديد مستوى التعقيد بناءً على المحتوى
     */
    determineComplexity(content: string): 'basic' | 'detailed' | 'comprehensive' {
        const wordCount = content.split(' ').length;
        if (wordCount < 100) return 'basic';
        if (wordCount < 500) return 'detailed';
        return 'comprehensive';
    },

    /**
     * إنشاء عنوان ذكي للمخطط
     */
    generateSmartTitle(type: DiagramType, context: string): string {
        const typeInfo = DIAGRAM_TYPES[type];
        const contextWords = context.split(' ').slice(0, 3).join(' ');
        return `${typeInfo.title} - ${contextWords}`;
    },

    /**
     * التحقق من صحة كود PlantUML
     */
    validatePlantUMLCode(code: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        let isValid = true;

        if (!code.includes('@startuml')) {
            errors.push('الكود يجب أن يبدأ بـ @startuml');
            isValid = false;
        }

        if (!code.includes('@enduml')) {
            errors.push('الكود يجب أن ينتهي بـ @enduml');
            isValid = false;
        }

        // فحص الأقواس المتوازنة
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push('الأقواس المجعدة غير متوازنة');
            isValid = false;
        }

        return { isValid, errors };
    }
};
