/**
 * خدمة ذكية لتوليد أقسام مقترح المشروع
 * تدعم توليد جميع أقسام المقترح بالذكاء الاصطناعي المتقدم
 */

import { apiClient } from '@/services/shared/api-client';

// أنواع أقسام المقترح
export type ProposalSectionType =
    | 'executive_summary'      // الملخص التنفيذي
    | 'problem_statement'      // بيان المشكلة
    | 'objectives'             // الأهداف
    | 'scope'                  // نطاق المشروع
    | 'methodology'            // المنهجية
    | 'timeline'               // الجدول الزمني
    | 'budget'                 // الميزانية
    | 'team'                   // فريق العمل
    | 'deliverables'           // المخرجات المتوقعة
    | 'risk_assessment'        // تقييم المخاطر
    | 'success_criteria'       // معايير النجاح
    | 'conclusion'             // الخاتمة
    | 'appendices';            // الملاحق

// فئات أقسام المقترح
export type ProposalSectionCategory =
    | 'overview'               // نظرة عامة
    | 'planning'               // تخطيط
    | 'execution'              // تنفيذ
    | 'management'             // إدارة
    | 'evaluation';            // تقييم

// مستوى تفصيل القسم
export type ProposalComplexity = 'basic' | 'detailed' | 'comprehensive';

// أسلوب كتابة المقترح
export type ProposalStyle = {
    tone: 'formal' | 'professional' | 'academic' | 'business';
    length: 'concise' | 'moderate' | 'detailed' | 'extensive';
    format: 'narrative' | 'structured' | 'bullet_points' | 'mixed';
    language: 'ar' | 'en';
};

// معلومات قسم المقترح
export interface ProposalSectionInfo {
    type: ProposalSectionType;
    title: string;
    description: string;
    category: ProposalSectionCategory;
    complexity: ProposalComplexity;
    estimatedLength: number; // عدد الكلمات المتوقع
    dependencies: ProposalSectionType[]; // الأقسام التي يعتمد عليها
    keyElements: string[]; // العناصر الأساسية
    useCases: string[]; // حالات الاستخدام
    icon: string;
}

// خيارات توليد القسم
export interface ProposalSectionGenerationOptions {
    type: ProposalSectionType;
    title?: string;
    description?: string;

    // سياق المشروع
    projectContext: {
        title: string;
        description: string;
        domain?: string;
        industry?: string;
        targetAudience?: string;
        budget?: number;
        duration?: number;
        teamSize?: number;
        objectives?: string[];
        requirements?: string[];
        constraints?: string[];
        stakeholders?: string[];
        technologies?: string[];
    };

    // محتوى مرجعي
    referenceContent?: {
        existingSections?: Record<string, string>;
        guidelines?: string;
        templates?: string[];
        examples?: string[];
    };

    // إعدادات التوليد
    style: ProposalStyle;
    complexity: ProposalComplexity;

    // إعدادات ذكية
    intelligentSettings?: {
        enableContextAnalysis?: boolean;
        enableIterativeImprovement?: boolean;
        enablePerformanceMonitoring?: boolean;
        qualityThreshold?: number;
        maxIterations?: number;
        adaptiveModelSelection?: boolean;
    };

    // تفضيلات المخرجات
    outputPreferences?: {
        includeOutline?: boolean;
        includeKeyPoints?: boolean;
        generateSuggestions?: boolean;
        validateContent?: boolean;
    };
}

// نتيجة توليد القسم
export interface ProposalSectionResult {
    type: ProposalSectionType;
    title: string;
    content: string;
    outline: string[];
    keyPoints: string[];
    wordCount: number;

    // معلومات الجودة
    qualityScore: number;
    completeness: number;
    clarity: number;
    relevance: number;

    // اقتراحات التحسين
    suggestions: string[];

    // معلومات الأداء
    metadata: {
        generatedAt: string;
        executionTime: number;
        modelUsed: string;
        iterations: number;
        qualityScore: number;
    };

    // أقسام مقترحة ذات صلة
    relatedSections: ProposalSectionType[];
}

// خيارات توليد المقترح الكامل
export interface CompleteProposalGenerationOptions {
    projectContext: ProposalSectionGenerationOptions['projectContext'];
    sectionsToGenerate: ProposalSectionType[];
    style: ProposalStyle;
    complexity: ProposalComplexity;

    // إعدادات ذكية
    intelligentSettings?: {
        generateInOrder?: boolean;
        useIntelligentDependencies?: boolean;
        enableCrossReferencing?: boolean;
        enableConsistencyCheck?: boolean;
        qualityThreshold?: number;
        maxRetries?: number;
    };

    referenceContent?: {
        guidelines?: string;
        templates?: string[];
        examples?: string[];
    };
}

// نتيجة توليد المقترح الكامل
export interface CompleteProposalResult {
    sections: Record<ProposalSectionType, ProposalSectionResult>;
    overallQuality: number;
    totalWordCount: number;
    estimatedReadingTime: number;

    // تحليل شامل
    analysis: {
        consistency: number;
        coherence: number;
        completeness: number;
        professionalTone: number;
    };

    // اقتراحات عامة
    generalSuggestions: string[];

    // معلومات الأداء
    performanceMetrics: {
        totalExecutionTime: number;
        sectionsGenerated: number;
        averageQuality: number;
        totalIterations: number;
    };
}

// مرشح أقسام المقترح
export interface ProposalSectionFilter {
    category?: ProposalSectionCategory;
    complexity?: ProposalComplexity;
    searchTerm?: string;
    sortBy?: 'name' | 'category' | 'complexity' | 'length';
}

// إحصائيات أقسام المقترح
export interface ProposalSectionStats {
    totalGenerated: number;
    byType: Record<ProposalSectionType, number>;
    byCategory: Record<ProposalSectionCategory, number>;
    averageQuality: number;
    averageWordCount: number;
    mostUsedTypes: ProposalSectionType[];
    averageGenerationTime: number;
}

// معلومات أنواع أقسام المقترح
export const PROPOSAL_SECTION_TYPES: Record<ProposalSectionType, ProposalSectionInfo> = {
    executive_summary: {
        type: 'executive_summary',
        title: 'الملخص التنفيذي',
        description: 'نظرة عامة موجزة وشاملة عن المشروع وأهدافه الرئيسية',
        category: 'overview',
        complexity: 'detailed',
        estimatedLength: 300,
        dependencies: [],
        keyElements: ['نظرة عامة', 'الأهداف الرئيسية', 'الفوائد المتوقعة', 'التوصية'],
        useCases: ['تقديم المشروع للإدارة العليا', 'جذب انتباه المستثمرين', 'تلخيص المقترح'],
        icon: '📋'
    },

    problem_statement: {
        type: 'problem_statement',
        title: 'بيان المشكلة',
        description: 'تحديد واضح للمشكلة أو الحاجة التي يهدف المشروع لحلها',
        category: 'overview',
        complexity: 'detailed',
        estimatedLength: 400,
        dependencies: [],
        keyElements: ['تعريف المشكلة', 'تأثير المشكلة', 'الحاجة للحل', 'الفرصة المتاحة'],
        useCases: ['تبرير الحاجة للمشروع', 'توضيح السياق', 'إقناع أصحاب المصلحة'],
        icon: '🎯'
    },

    objectives: {
        type: 'objectives',
        title: 'الأهداف',
        description: 'الأهداف الواضحة والقابلة للقياس التي يسعى المشروع لتحقيقها',
        category: 'planning',
        complexity: 'detailed',
        estimatedLength: 350,
        dependencies: ['problem_statement'],
        keyElements: ['الأهداف الرئيسية', 'الأهداف الفرعية', 'مؤشرات النجاح', 'الجدول الزمني'],
        useCases: ['توجيه تنفيذ المشروع', 'قياس التقدم', 'تقييم النجاح'],
        icon: '🎯'
    },

    scope: {
        type: 'scope',
        title: 'نطاق المشروع',
        description: 'تحديد حدود المشروع وما يشمله وما لا يشمله',
        category: 'planning',
        complexity: 'detailed',
        estimatedLength: 300,
        dependencies: ['objectives'],
        keyElements: ['النطاق المشمول', 'النطاق المستبعد', 'الحدود', 'الافتراضات'],
        useCases: ['منع توسع النطاق', 'توضيح التوقعات', 'إدارة الموارد'],
        icon: '🔍'
    },

    methodology: {
        type: 'methodology',
        title: 'المنهجية',
        description: 'الطرق والأساليب التي سيتم استخدامها لتنفيذ المشروع',
        category: 'execution',
        complexity: 'comprehensive',
        estimatedLength: 500,
        dependencies: ['scope'],
        keyElements: ['منهجية العمل', 'الأدوات والتقنيات', 'العمليات', 'معايير الجودة'],
        useCases: ['توجيه التنفيذ', 'ضمان الجودة', 'تدريب الفريق'],
        icon: '⚙️'
    },

    timeline: {
        type: 'timeline',
        title: 'الجدول الزمني',
        description: 'خطة زمنية مفصلة لمراحل وأنشطة المشروع',
        category: 'planning',
        complexity: 'detailed',
        estimatedLength: 400,
        dependencies: ['methodology'],
        keyElements: ['المراحل الرئيسية', 'الأنشطة', 'المدد الزمنية', 'المعالم المهمة'],
        useCases: ['تخطيط الموارد', 'متابعة التقدم', 'إدارة التوقعات'],
        icon: '📅'
    },

    budget: {
        type: 'budget',
        title: 'الميزانية',
        description: 'تقدير مفصل للتكاليف والموارد المالية المطلوبة',
        category: 'management',
        complexity: 'detailed',
        estimatedLength: 350,
        dependencies: ['timeline'],
        keyElements: ['تكاليف الموارد البشرية', 'التكاليف التقنية', 'التكاليف التشغيلية', 'الاحتياطي'],
        useCases: ['تخطيط الميزانية', 'الحصول على التمويل', 'مراقبة التكاليف'],
        icon: '💰'
    },

    team: {
        type: 'team',
        title: 'فريق العمل',
        description: 'تحديد أعضاء الفريق وأدوارهم ومسؤولياتهم',
        category: 'management',
        complexity: 'detailed',
        estimatedLength: 300,
        dependencies: ['methodology'],
        keyElements: ['هيكل الفريق', 'الأدوار والمسؤوليات', 'المهارات المطلوبة', 'خطة التدريب'],
        useCases: ['تنظيم الفريق', 'توزيع المهام', 'تطوير المهارات'],
        icon: '👥'
    },

    deliverables: {
        type: 'deliverables',
        title: 'المخرجات المتوقعة',
        description: 'النتائج والمخرجات الملموسة التي سيتم تسليمها',
        category: 'execution',
        complexity: 'detailed',
        estimatedLength: 350,
        dependencies: ['objectives', 'scope'],
        keyElements: ['المخرجات الرئيسية', 'معايير الجودة', 'مواعيد التسليم', 'آلية التسليم'],
        useCases: ['تحديد التوقعات', 'قياس التقدم', 'ضمان الجودة'],
        icon: '📦'
    },

    risk_assessment: {
        type: 'risk_assessment',
        title: 'تقييم المخاطر',
        description: 'تحديد وتحليل المخاطر المحتملة وخطط التعامل معها',
        category: 'management',
        complexity: 'comprehensive',
        estimatedLength: 450,
        dependencies: ['timeline', 'budget'],
        keyElements: ['المخاطر المحتملة', 'تقييم الأثر', 'الاحتمالية', 'خطط التخفيف'],
        useCases: ['إدارة المخاطر', 'التخطيط للطوارئ', 'اتخاذ قرارات مدروسة'],
        icon: '⚠️'
    },

    success_criteria: {
        type: 'success_criteria',
        title: 'معايير النجاح',
        description: 'المقاييس والمعايير التي ستحدد نجاح المشروع',
        category: 'evaluation',
        complexity: 'detailed',
        estimatedLength: 300,
        dependencies: ['objectives', 'deliverables'],
        keyElements: ['مؤشرات الأداء الرئيسية', 'معايير الجودة', 'مقاييس الرضا', 'آليات التقييم'],
        useCases: ['قياس النجاح', 'تقييم الأداء', 'تحسين مستمر'],
        icon: '✅'
    },

    conclusion: {
        type: 'conclusion',
        title: 'الخاتمة',
        description: 'تلخيص المقترح والدعوة لاتخاذ إجراء',
        category: 'overview',
        complexity: 'basic',
        estimatedLength: 200,
        dependencies: ['success_criteria'],
        keyElements: ['تلخيص الفوائد', 'التوصية', 'الخطوات التالية', 'دعوة للعمل'],
        useCases: ['إنهاء المقترح بقوة', 'تحفيز اتخاذ القرار', 'تلخيص القيمة'],
        icon: '🎯'
    },

    appendices: {
        type: 'appendices',
        title: 'الملاحق',
        description: 'معلومات إضافية ومراجع داعمة للمقترح',
        category: 'overview',
        complexity: 'basic',
        estimatedLength: 150,
        dependencies: [],
        keyElements: ['المراجع', 'البيانات الداعمة', 'النماذج', 'التفاصيل التقنية'],
        useCases: ['دعم المعلومات', 'توفير التفاصيل', 'المراجع العلمية'],
        icon: '📎'
    }
};

/**
 * فئة خدمة أقسام المقترح الذكية
 */
export class IntelligentProposalService {
    private baseUrl = '/api/generate/proposal-section';

    /**
     * توليد قسم واحد من المقترح
     */
    async generateSection(options: ProposalSectionGenerationOptions): Promise<ProposalSectionResult> {
        try {
            const response = await apiClient.post(this.baseUrl, options);
            return response.data;
        } catch (error) {
            console.error('خطأ في توليد قسم المقترح:', error);
            throw new Error('فشل في توليد قسم المقترح');
        }
    }

    /**
     * توليد مقترح كامل
     */
    async generateCompleteProposal(options: CompleteProposalGenerationOptions): Promise<CompleteProposalResult> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/complete`, options);
            return response.data;
        } catch (error) {
            console.error('خطأ في توليد المقترح الكامل:', error);
            throw new Error('فشل في توليد المقترح الكامل');
        }
    }

    /**
     * الحصول على إحصائيات أقسام المقترح
     */
    async getStats(): Promise<ProposalSectionStats> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/stats`);
            return response.data;
        } catch (error) {
            console.error('خطأ في الحصول على إحصائيات أقسام المقترح:', error);
            throw new Error('فشل في الحصول على الإحصائيات');
        }
    }

    /**
     * التحقق من صحة محتوى القسم
     */
    async validateSection(type: ProposalSectionType, content: string): Promise<{
        isValid: boolean;
        score: number;
        issues: string[];
        suggestions: string[];
    }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/validate`, {
                type,
                content
            });
            return response.data;
        } catch (error) {
            console.error('خطأ في التحقق من صحة القسم:', error);
            throw new Error('فشل في التحقق من صحة القسم');
        }
    }

    /**
     * تحسين محتوى قسم موجود
     */
    async improveSection(
        type: ProposalSectionType,
        content: string,
        improvementAreas: string[]
    ): Promise<{
        improvedContent: string;
        improvements: string[];
        qualityScore: number;
    }> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/improve`, {
                type,
                content,
                improvementAreas
            });
            return response.data;
        } catch (error) {
            console.error('خطأ في تحسين القسم:', error);
            throw new Error('فشل في تحسين القسم');
        }
    }

    /**
     * الحصول على قوالب جاهزة
     */
    async getTemplates(type?: ProposalSectionType): Promise<{
        type: ProposalSectionType;
        title: string;
        template: string;
        description: string;
    }[]> {
        try {
            const url = type ? `${this.baseUrl}/templates?type=${type}` : `${this.baseUrl}/templates`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('خطأ في الحصول على القوالب:', error);
            throw new Error('فشل في الحصول على القوالب');
        }
    }

    /**
     * تقدير وقت القراءة
     */
    estimateReadingTime(wordCount: number): number {
        // متوسط سرعة القراءة: 200 كلمة في الدقيقة
        return Math.ceil(wordCount / 200);
    }

    /**
     * تقدير وقت التوليد
     */
    estimateGenerationTime(complexity: ProposalComplexity, hasContext: boolean): string {
        let baseTime = 30; // ثواني

        switch (complexity) {
            case 'basic':
                baseTime = 20;
                break;
            case 'detailed':
                baseTime = 45;
                break;
            case 'comprehensive':
                baseTime = 90;
                break;
        }

        if (hasContext) baseTime *= 1.3;

        return `${Math.round(baseTime)} ثانية`;
    }

    /**
     * التحقق من التبعيات
     */
    checkDependencies(
        sectionType: ProposalSectionType,
        existingSections: ProposalSectionType[]
    ): {
        satisfied: boolean;
        missing: ProposalSectionType[];
        recommendations: string[];
    } {
        const sectionInfo = PROPOSAL_SECTION_TYPES[sectionType];
        const missing = sectionInfo.dependencies.filter(dep => !existingSections.includes(dep));

        const recommendations: string[] = [];
        if (missing.length > 0) {
            recommendations.push(`يُنصح بإنشاء الأقسام التالية أولاً: ${missing.map(m => PROPOSAL_SECTION_TYPES[m].title).join(', ')}`);
        }

        return {
            satisfied: missing.length === 0,
            missing,
            recommendations
        };
    }

    /**
     * اقتراح ترتيب الأقسام
     */
    suggestSectionOrder(sections: ProposalSectionType[]): ProposalSectionType[] {
        // ترتيب منطقي مقترح
        const order: ProposalSectionType[] = [
            'executive_summary',
            'problem_statement',
            'objectives',
            'scope',
            'methodology',
            'timeline',
            'budget',
            'team',
            'deliverables',
            'risk_assessment',
            'success_criteria',
            'conclusion',
            'appendices'
        ];

        return order.filter(section => sections.includes(section));
    }

    /**
     * تحليل جودة المقترح الكامل
     */
    analyzeProposalQuality(sections: Record<string, ProposalSectionResult>): {
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } {
        const scores = Object.values(sections).map(s => s.qualityScore);
        const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const recommendations: string[] = [];

        if (overallScore >= 85) {
            strengths.push('جودة عالية في المحتوى');
        }

        if (overallScore < 70) {
            weaknesses.push('يحتاج تحسين في الجودة العامة');
            recommendations.push('مراجعة وتحسين الأقسام ذات النقاط المنخفضة');
        }

        // تحليل التوازن
        const wordCounts = Object.values(sections).map(s => s.wordCount);
        const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
        const imbalanced = wordCounts.some(count => count < avgWordCount * 0.5 || count > avgWordCount * 2);

        if (imbalanced) {
            weaknesses.push('عدم توازن في أطوال الأقسام');
            recommendations.push('توحيد مستوى التفصيل بين الأقسام');
        }

        return {
            overallScore,
            strengths,
            weaknesses,
            recommendations
        };
    }
}

// إنشاء مثيل الخدمة
export const intelligentProposalService = new IntelligentProposalService();

// أدوات مساعدة
export class ProposalUtils {
    /**
     * تصفية أقسام المقترح
     */
    static filterSections(
        sections: ProposalSectionInfo[],
        filter: ProposalSectionFilter
    ): ProposalSectionInfo[] {
        let filtered = [...sections];

        if (filter.category) {
            filtered = filtered.filter(s => s.category === filter.category);
        }

        if (filter.complexity) {
            filtered = filtered.filter(s => s.complexity === filter.complexity);
        }

        if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(term) ||
                s.description.toLowerCase().includes(term) ||
                s.keyElements.some(e => e.toLowerCase().includes(term))
            );
        }

        // ترتيب النتائج
        if (filter.sortBy) {
            filtered.sort((a, b) => {
                switch (filter.sortBy) {
                    case 'name':
                        return a.title.localeCompare(b.title);
                    case 'category':
                        return a.category.localeCompare(b.category);
                    case 'complexity':
                        const complexityOrder = { basic: 1, detailed: 2, comprehensive: 3 };
                        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
                    case 'length':
                        return a.estimatedLength - b.estimatedLength;
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }

    /**
     * حساب إجمالي الكلمات المتوقعة
     */
    static calculateTotalWords(sections: ProposalSectionType[]): number {
        return sections.reduce((total, type) => {
            return total + PROPOSAL_SECTION_TYPES[type].estimatedLength;
        }, 0);
    }

    /**
     * تجميع الأقسام حسب الفئة
     */
    static groupByCategory(sections: ProposalSectionType[]): Record<ProposalSectionCategory, ProposalSectionType[]> {
        const groups: Record<ProposalSectionCategory, ProposalSectionType[]> = {
            overview: [],
            planning: [],
            execution: [],
            management: [],
            evaluation: []
        };

        sections.forEach(type => {
            const category = PROPOSAL_SECTION_TYPES[type].category;
            groups[category].push(type);
        });

        return groups;
    }
}
