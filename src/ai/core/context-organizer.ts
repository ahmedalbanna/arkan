/**
 * نظام ذكي لتنظيم وترتيب السياقات المختلفة حسب المعرفة والأهمية
 * يقوم بتحليل السياقات وتجميعها وترتيبها في المطالبة بناءً على نوع المعرفة
 */

import { z } from 'zod';

// أنواع السياق المختلفة مع أوزانها المعرفية
export const ContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines']);
export type ContextType = z.infer<typeof ContextTypeSchema>;

// مستوى الأهمية المعرفية
export const KnowledgeLevelSchema = z.enum(['foundational', 'conceptual', 'procedural', 'metacognitive']);
export type KnowledgeLevel = z.infer<typeof KnowledgeLevelSchema>;

// أولوية السياق في المطالبة
export const ContextPrioritySchema = z.enum(['critical', 'important', 'supporting', 'reference']);
export type ContextPriority = z.infer<typeof ContextPrioritySchema>;

export interface ContextItem {
    fileName: string;
    content: string;
    type: ContextType;
    relevance?: number;
    knowledgeLevel?: KnowledgeLevel;
    priority?: ContextPriority;
    metadata?: {
        wordCount?: number;
        complexity?: 'low' | 'medium' | 'high';
        domain?: string;
        language?: 'ar' | 'en';
    };
}

export interface OrganizedContext {
    // السياقات الأساسية (الأولوية العالية)
    foundational: ContextItem[];

    // السياقات المفاهيمية (الأولوية المتوسطة)
    conceptual: ContextItem[];

    // السياقات الإجرائية (الأولوية المتوسطة)
    procedural: ContextItem[];

    // السياقات المرجعية (الأولوية المنخفضة)
    reference: ContextItem[];

    // السياقات الإرشادية (أولوية خاصة)
    guidelines: ContextItem[];

    // إحصائيات التنظيم
    statistics: {
        totalItems: number;
        byType: Record<ContextType, number>;
        byPriority: Record<ContextPriority, number>;
        averageRelevance: number;
    };
}

export class ContextOrganizer {
    // أوزان أنواع السياق حسب الأهمية المعرفية
    private static readonly CONTEXT_TYPE_WEIGHTS: Record<ContextType, number> = {
        'guidelines': 0.95,      // الإرشادات - الأهمية القصوى
        'textbook': 0.85,        // الكتب المرجعية - معرفة أساسية
        'context': 0.75,         // السياق العام - معرفة مهمة
        'example': 0.65,         // الأمثلة - معرفة تطبيقية
        'question': 0.55         // الأسئلة - معرفة استكشافية
    };

    // مستويات المعرفة وأوزانها
    private static readonly KNOWLEDGE_LEVEL_WEIGHTS: Record<KnowledgeLevel, number> = {
        'foundational': 0.9,     // المعرفة الأساسية - الأهمية القصوى
        'conceptual': 0.8,       // المعرفة المفاهيمية - أهمية عالية
        'procedural': 0.7,       // المعرفة الإجرائية - أهمية متوسطة
        'metacognitive': 0.6     // المعرفة ما وراء المعرفية - أهمية منخفضة
    };

    /**
     * تنظيم السياقات حسب المعرفة والأهمية
     */
    static organizeContexts(
        contexts: ContextItem[],
        targetSection?: string,
        userRequirements?: string[]
    ): OrganizedContext {
        console.log(`🧠 تنظيم ${contexts.length} سياق حسب المعرفة والأهمية`);

        // تحليل كل سياق وتحديد خصائصه المعرفية
        const analyzedContexts = contexts.map(context =>
            this.analyzeContext(context, targetSection, userRequirements)
        );

        // ترتيب السياقات حسب الأولوية المعرفية
        const sortedContexts = analyzedContexts.sort((a, b) => {
            const scoreA = this.calculateContextScore(a);
            const scoreB = this.calculateContextScore(b);
            return scoreB - scoreA;
        });

        // تجميع السياقات حسب نوع المعرفة
        const organized = this.groupByKnowledgeType(sortedContexts);

        // حساب الإحصائيات
        const statistics = this.calculateStatistics(organized);

        console.log(`✅ تم تنظيم السياقات: ${statistics.totalItems} عنصر في ${Object.keys(organized).length} فئة`);

        return {
            ...organized,
            statistics
        };
    }

    /**
     * تحليل سياق واحد وتحديد خصائصه المعرفية
     */
    private static analyzeContext(
        context: ContextItem,
        targetSection?: string,
        userRequirements?: string[]
    ): ContextItem {
        const analysis = {
            ...context,
            relevance: this.calculateRelevance(context, targetSection, userRequirements),
            knowledgeLevel: this.determineKnowledgeLevel(context),
            priority: this.determinePriority(context),
            metadata: {
                ...context.metadata,
                wordCount: context.content.length,
                complexity: this.assessComplexity(context.content),
                domain: this.extractDomain(context.content),
                language: this.detectLanguage(context.content)
            }
        };

        return analysis;
    }

    /**
     * حساب درجة السياق الإجمالية
     */
    private static calculateContextScore(context: ContextItem): number {
        const typeWeight = this.CONTEXT_TYPE_WEIGHTS[context.type] || 0.5;
        const knowledgeWeight = context.knowledgeLevel ?
            this.KNOWLEDGE_LEVEL_WEIGHTS[context.knowledgeLevel] : 0.5;
        const relevanceWeight = context.relevance || 0.5;
        const priorityWeight = this.getPriorityWeight(context.priority);

        // حساب النتيجة المرجحة
        const score = (typeWeight * 0.3) +
            (knowledgeWeight * 0.3) +
            (relevanceWeight * 0.25) +
            (priorityWeight * 0.15);

        return Math.round(score * 100) / 100;
    }

    /**
     * تحديد مستوى المعرفة للسياق
     */
    private static determineKnowledgeLevel(context: ContextItem): KnowledgeLevel {
        const content = context.content.toLowerCase();

        // المعرفة الأساسية - التعريفات والمفاهيم الأساسية
        if (context.type === 'textbook' ||
            content.includes('definition') ||
            content.includes('concept') ||
            content.includes('fundamental')) {
            return 'foundational';
        }

        // المعرفة المفاهيمية - النظريات والمبادئ
        if (content.includes('theory') ||
            content.includes('principle') ||
            content.includes('framework') ||
            content.includes('model')) {
            return 'conceptual';
        }

        // المعرفة الإجرائية - الخطوات والإجراءات
        if (context.type === 'example' ||
            content.includes('step') ||
            content.includes('process') ||
            content.includes('procedure') ||
            content.includes('method')) {
            return 'procedural';
        }

        // المعرفة ما وراء المعرفية - التفكير والتحليل
        if (context.type === 'question' ||
            content.includes('analysis') ||
            content.includes('evaluation') ||
            content.includes('critique')) {
            return 'metacognitive';
        }

        return 'conceptual'; // افتراضي
    }

    /**
     * تحديد أولوية السياق
     */
    private static determinePriority(context: ContextItem): ContextPriority {
        if (context.type === 'guidelines') return 'critical';
        if (context.type === 'textbook') return 'important';
        if (context.type === 'context') return 'supporting';
        if (context.type === 'example') return 'supporting';
        if (context.type === 'question') return 'reference';

        return 'reference';
    }

    /**
     * حساب صلة السياق بالمهمة المطلوبة
     */
    private static calculateRelevance(
        context: ContextItem,
        targetSection?: string,
        userRequirements?: string[]
    ): number {
        let relevance = 0.5; // قيمة افتراضية

        // زيادة الصلة حسب نوع السياق
        if (context.type === 'guidelines') relevance += 0.3;
        if (context.type === 'textbook') relevance += 0.2;
        if (context.type === 'context') relevance += 0.1;
        if (context.type === 'example') relevance += 0.1;
        if (context.type === 'question') relevance += 0.1;

        // زيادة الصلة حسب وجود كلمات مفتاحية في القسم المستهدف
        if (targetSection) {
            const sectionKeywords = this.extractKeywords(targetSection);
            const contentKeywords = this.extractKeywords(context.content);
            const commonKeywords = sectionKeywords.filter(kw => contentKeywords.includes(kw));
            relevance += (commonKeywords.length / sectionKeywords.length) * 0.2;
        }

        // زيادة الصلة حسب المتطلبات المحددة
        if (userRequirements) {
            const requirementKeywords = userRequirements.flatMap(req => this.extractKeywords(req));
            const contentKeywords = this.extractKeywords(context.content);
            const commonKeywords = requirementKeywords.filter(kw => contentKeywords.includes(kw));
            relevance += (commonKeywords.length / requirementKeywords.length) * 0.1;
        }

        return Math.min(relevance, 1.0);
    }

    /**
     * تجميع السياقات حسب نوع المعرفة
     */
    private static groupByKnowledgeType(contexts: ContextItem[]): Omit<OrganizedContext, 'statistics'> {
        const groups = {
            foundational: [] as ContextItem[],
            conceptual: [] as ContextItem[],
            procedural: [] as ContextItem[],
            reference: [] as ContextItem[],
            guidelines: [] as ContextItem[],
            metacognitive: [] as ContextItem[]
        };

        contexts.forEach(context => {
            if (context.type === 'guidelines') {
                groups.guidelines.push(context);
            } else {
                const knowledgeLevel = context.knowledgeLevel || 'conceptual';
                groups[knowledgeLevel].push(context);
            }
        });

        return groups;
    }

    /**
     * حساب الإحصائيات
     */
    private static calculateStatistics(organized: Omit<OrganizedContext, 'statistics'>): OrganizedContext['statistics'] {
        const allContexts = [
            ...organized.foundational,
            ...organized.conceptual,
            ...organized.procedural,
            ...organized.reference,
            ...organized.guidelines
        ];

        const byType: Record<ContextType, number> = {
            context: 0,
            example: 0,
            question: 0,
            textbook: 0,
            guidelines: 0
        };

        const byPriority: Record<ContextPriority, number> = {
            critical: 0,
            important: 0,
            supporting: 0,
            reference: 0
        };

        allContexts.forEach(context => {
            byType[context.type]++;
            if (context.priority) {
                byPriority[context.priority]++;
            }
        });

        const averageRelevance = allContexts.reduce((sum, ctx) => sum + (ctx.relevance || 0), 0) / allContexts.length;

        return {
            totalItems: allContexts.length,
            byType,
            byPriority,
            averageRelevance: Math.round(averageRelevance * 100) / 100
        };
    }

    // دوال مساعدة
    private static getPriorityWeight(priority?: ContextPriority): number {
        const weights = {
            critical: 1.0,
            important: 0.8,
            supporting: 0.6,
            reference: 0.4
        };
        return priority ? weights[priority] : 0.5;
    }

    private static assessComplexity(content: string): 'low' | 'medium' | 'high' {
        const wordCount = content.split(' ').length;
        const sentenceCount = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;

        if (avgWordsPerSentence > 20 || wordCount > 1000) return 'high';
        if (avgWordsPerSentence > 15 || wordCount > 500) return 'medium';
        return 'low';
    }

    private static extractDomain(content: string): string {
        const domains = {
            technical: ['api', 'database', 'system', 'code', 'algorithm'],
            business: ['business', 'market', 'strategy', 'revenue', 'profit'],
            academic: ['research', 'study', 'analysis', 'thesis', 'methodology'],
            creative: ['design', 'creative', 'story', 'content', 'brand']
        };

        const lowerContent = content.toLowerCase();
        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                return domain;
            }
        }
        return 'general';
    }

    private static detectLanguage(content: string): 'ar' | 'en' {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(content) ? 'ar' : 'en';
    }

    private static extractKeywords(text: string): string[] {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 20); // أول 20 كلمة مفتاحية
    }
}

/**
 * دالة مساعدة لإنشاء مطالبة منظمة من السياقات المنظمة
 */
export function createOrganizedPrompt(organizedContext: OrganizedContext): string {
    let prompt = '';

    // السياقات الإرشادية (الأولوية القصوى)
    if (organizedContext.guidelines.length > 0) {
        prompt += '## 📋 الإرشادات والتوجيهات\n\n';
        organizedContext.guidelines.forEach((guideline, index) => {
            prompt += `### إرشاد ${index + 1}: ${guideline.fileName}\n`;
            prompt += `${guideline.content}\n\n`;
        });
    }

    // المعرفة الأساسية
    if (organizedContext.foundational.length > 0) {
        prompt += '## 🏗️ المعرفة الأساسية\n\n';
        organizedContext.foundational.forEach((context, index) => {
            prompt += `### ${context.fileName}\n`;
            prompt += `${context.content}\n\n`;
        });
    }

    // المعرفة المفاهيمية
    if (organizedContext.conceptual.length > 0) {
        prompt += '## 💡 المعرفة المفاهيمية\n\n';
        organizedContext.conceptual.forEach((context, index) => {
            prompt += `### ${context.fileName}\n`;
            prompt += `${context.content}\n\n`;
        });
    }

    // المعرفة الإجرائية
    if (organizedContext.procedural.length > 0) {
        prompt += '## ⚙️ المعرفة الإجرائية\n\n';
        organizedContext.procedural.forEach((context, index) => {
            prompt += `### ${context.fileName}\n`;
            prompt += `${context.content}\n\n`;
        });
    }

    // المراجع
    if (organizedContext.reference.length > 0) {
        prompt += '## 📚 المراجع الإضافية\n\n';
        organizedContext.reference.forEach((context, index) => {
            prompt += `### ${context.fileName}\n`;
            prompt += `${context.content}\n\n`;
        });
    }

    // إحصائيات السياق
    prompt += '## 📊 إحصائيات السياق\n\n';
    prompt += `- إجمالي العناصر: ${organizedContext.statistics.totalItems}\n`;
    prompt += `- متوسط الصلة: ${organizedContext.statistics.averageRelevance}\n`;
    prompt += `- التوزيع حسب النوع: ${Object.entries(organizedContext.statistics.byType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ')}\n`;

    return prompt;
}
