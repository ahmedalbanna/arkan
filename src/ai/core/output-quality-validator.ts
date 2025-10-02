/**
 * نظام التحقق من جودة المخرجات وتقييمها
 * يحلل المخرجات ويقترح التحسينات
 */

import { ContextAnalysisResult } from './context-analyzer';

export interface QualityMetrics {
    completeness: number; // 0-100
    accuracy: number; // 0-100
    relevance: number; // 0-100
    clarity: number; // 0-100
    structure: number; // 0-100
    overall: number; // 0-100
}

export interface QualityIssue {
    type: 'missing_content' | 'unclear_language' | 'poor_structure' | 'irrelevant_content' | 'factual_error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
    location?: string;
}

export interface ValidationResult {
    isValid: boolean;
    metrics: QualityMetrics;
    issues: QualityIssue[];
    suggestions: string[];
    needsImprovement: boolean;
    improvementPrompt?: string;
}

export class OutputQualityValidator {

    /**
     * تقييم شامل لجودة المخرجات
     */
    static async validateOutput(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult,
        expectedSchema?: any
    ): Promise<ValidationResult> {

        const metrics = await this.calculateQualityMetrics(output, originalInput, contextAnalysis);
        const issues = await this.identifyQualityIssues(output, originalInput, contextAnalysis);
        const suggestions = this.generateSuggestions(issues, metrics);

        const overall = metrics.overall;
        const isValid = overall >= 70; // حد أدنى للقبول
        const needsImprovement = overall < 85; // حد التحسين

        let improvementPrompt: string | undefined;
        if (needsImprovement) {
            improvementPrompt = this.generateImprovementPrompt(output, issues, contextAnalysis);
        }

        return {
            isValid,
            metrics,
            issues,
            suggestions,
            needsImprovement,
            improvementPrompt
        };
    }

    /**
     * حساب مقاييس الجودة
     */
    private static async calculateQualityMetrics(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): Promise<QualityMetrics> {

        const completeness = this.assessCompleteness(output, originalInput, contextAnalysis);
        const accuracy = this.assessAccuracy(output, contextAnalysis);
        const relevance = this.assessRelevance(output, originalInput, contextAnalysis);
        const clarity = this.assessClarity(output, contextAnalysis);
        const structure = this.assessStructure(output, contextAnalysis);

        const overall = Math.round(
            (completeness * 0.25) +
            (accuracy * 0.25) +
            (relevance * 0.2) +
            (clarity * 0.15) +
            (structure * 0.15)
        );

        return {
            completeness,
            accuracy,
            relevance,
            clarity,
            structure,
            overall
        };
    }

    /**
     * تقييم اكتمال المحتوى
     */
    private static assessCompleteness(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): number {
        let score = 50; // نقطة البداية

        // فحص طول المحتوى
        const wordCount = output.split(/\s+/).length;
        if (wordCount < 50) score -= 30;
        else if (wordCount < 100) score -= 15;
        else if (wordCount > 500) score += 10;

        // فحص تغطية المتطلبات
        const requirements = contextAnalysis.specificRequirements;
        if (requirements.length > 0) {
            const coveredRequirements = requirements.filter(req =>
                this.isRequirementCovered(output, req)
            ).length;
            const coverageRatio = coveredRequirements / requirements.length;
            score += Math.round(coverageRatio * 30);
        }

        // فحص وجود العناصر المطلوبة حسب نوع المحتوى
        switch (contextAnalysis.contentType) {
            case 'business':
                if (output.includes('هدف') || output.includes('objective')) score += 5;
                if (output.includes('ميزانية') || output.includes('budget')) score += 5;
                if (output.includes('جدول زمني') || output.includes('timeline')) score += 5;
                break;
            case 'technical':
                if (output.includes('متطلبات') || output.includes('requirements')) score += 5;
                if (output.includes('تصميم') || output.includes('design')) score += 5;
                if (output.includes('تنفيذ') || output.includes('implementation')) score += 5;
                break;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تقييم دقة المحتوى
     */
    private static assessAccuracy(output: string, contextAnalysis: ContextAnalysisResult): number {
        let score = 80; // افتراض الدقة العالية

        // فحص التناقضات الداخلية
        if (this.hasInternalContradictions(output)) {
            score -= 20;
        }

        // فحص المصطلحات التقنية
        if (contextAnalysis.contentType === 'technical') {
            const technicalTermsCorrect = this.validateTechnicalTerms(output);
            if (!technicalTermsCorrect) score -= 15;
        }

        // فحص التواريخ والأرقام
        if (this.hasInconsistentDatesOrNumbers(output)) {
            score -= 10;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تقييم صلة المحتوى
     */
    private static assessRelevance(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): number {
        let score = 70;

        // فحص الكلمات المفتاحية من المدخل الأصلي
        const inputKeywords = this.extractKeywords(originalInput);
        const outputKeywords = this.extractKeywords(output);

        const relevantKeywords = inputKeywords.filter(keyword =>
            outputKeywords.includes(keyword)
        ).length;

        if (inputKeywords.length > 0) {
            const relevanceRatio = relevantKeywords / inputKeywords.length;
            score += Math.round(relevanceRatio * 20);
        }

        // فحص الانحراف عن الموضوع
        if (this.hasTopicDrift(output, originalInput)) {
            score -= 15;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تقييم وضوح المحتوى
     */
    private static assessClarity(output: string, contextAnalysis: ContextAnalysisResult): number {
        let score = 75;

        // فحص طول الجمل
        const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

        if (avgSentenceLength > 25) score -= 10; // جمل طويلة جداً
        if (avgSentenceLength < 5) score -= 5; // جمل قصيرة جداً

        // فحص استخدام المصطلحات المعقدة
        if (contextAnalysis.complexityLevel === 'basic') {
            const complexTerms = this.countComplexTerms(output);
            if (complexTerms > 5) score -= 15;
        }

        // فحص التنظيم والهيكل
        if (!this.hasGoodStructure(output)) {
            score -= 10;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تقييم هيكل المحتوى
     */
    private static assessStructure(output: string, contextAnalysis: ContextAnalysisResult): number {
        let score = 60;

        // فحص وجود عناوين
        const hasHeaders = /^#+\s/.test(output) || output.includes('##') || output.includes('#');
        if (hasHeaders) score += 15;

        // فحص وجود فقرات منظمة
        const paragraphs = output.split('\n\n').filter(p => p.trim().length > 0);
        if (paragraphs.length >= 3) score += 10;

        // فحص وجود قوائم عند الحاجة
        const hasLists = output.includes('- ') || output.includes('* ') || /^\d+\./.test(output);
        if (hasLists) score += 10;

        // فحص التدفق المنطقي
        if (this.hasLogicalFlow(output)) score += 15;

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تحديد مشاكل الجودة
     */
    private static async identifyQualityIssues(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): Promise<QualityIssue[]> {
        const issues: QualityIssue[] = [];

        // فحص المحتوى المفقود
        const missingContent = this.findMissingContent(output, originalInput, contextAnalysis);
        issues.push(...missingContent);

        // فحص اللغة غير الواضحة
        const unclearLanguage = this.findUnclearLanguage(output, contextAnalysis);
        issues.push(...unclearLanguage);

        // فحص مشاكل الهيكل
        const structureIssues = this.findStructureIssues(output);
        issues.push(...structureIssues);

        // فحص المحتوى غير ذي الصلة
        const irrelevantContent = this.findIrrelevantContent(output, originalInput);
        issues.push(...irrelevantContent);

        return issues;
    }

    /**
     * إنتاج اقتراحات التحسين
     */
    private static generateSuggestions(issues: QualityIssue[], metrics: QualityMetrics): string[] {
        const suggestions: string[] = [];

        if (metrics.completeness < 70) {
            suggestions.push('أضف المزيد من التفاصيل لتغطية جميع جوانب الموضوع');
        }

        if (metrics.clarity < 70) {
            suggestions.push('استخدم جملاً أقصر وأوضح');
            suggestions.push('تجنب المصطلحات المعقدة غير الضرورية');
        }

        if (metrics.structure < 70) {
            suggestions.push('نظم المحتوى بعناوين وفقرات واضحة');
            suggestions.push('استخدم القوائم لتنظيم المعلومات');
        }

        // اقتراحات محددة حسب نوع المشاكل
        const criticalIssues = issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
            suggestions.push('تعامل مع المشاكل الحرجة أولاً');
        }

        return suggestions;
    }

    /**
     * إنتاج prompt للتحسين
     */
    private static generateImprovementPrompt(
        output: string,
        issues: QualityIssue[],
        contextAnalysis: ContextAnalysisResult
    ): string {
        let prompt = 'يرجى تحسين المحتوى التالي بناءً على المشاكل المحددة:\n\n';

        prompt += '**المشاكل المحددة:**\n';
        issues.forEach((issue, index) => {
            prompt += `${index + 1}. ${issue.description}\n`;
            prompt += `   الحل المقترح: ${issue.suggestion}\n\n`;
        });

        prompt += '**المحتوى الحالي:**\n';
        prompt += output + '\n\n';

        prompt += '**التعليمات:**\n';
        prompt += '- احتفظ بالمعلومات الصحيحة الموجودة\n';
        prompt += '- أضف المحتوى المفقود\n';
        prompt += '- حسن الوضوح والتنظيم\n';
        prompt += '- تأكد من الدقة والصلة بالموضوع\n';

        return prompt;
    }

    // Helper methods
    private static isRequirementCovered(output: string, requirement: string): boolean {
        const keywords = requirement.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        return keywords.some(keyword => output.toLowerCase().includes(keyword));
    }

    private static hasInternalContradictions(output: string): boolean {
        // تنفيذ بسيط - يمكن تحسينه
        const positiveWords = ['نعم', 'صحيح', 'موافق', 'yes', 'true', 'correct'];
        const negativeWords = ['لا', 'خطأ', 'غير صحيح', 'no', 'false', 'incorrect'];

        const hasPositive = positiveWords.some(word => output.toLowerCase().includes(word));
        const hasNegative = negativeWords.some(word => output.toLowerCase().includes(word));

        return hasPositive && hasNegative; // تبسيط - يحتاج تحسين
    }

    private static validateTechnicalTerms(output: string): boolean {
        // فحص أساسي للمصطلحات التقنية
        return true; // يمكن تطويره أكثر
    }

    private static hasInconsistentDatesOrNumbers(output: string): boolean {
        // فحص التواريخ والأرقام المتناقضة
        return false; // يمكن تطويره
    }

    private static extractKeywords(text: string): string[] {
        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word));
    }

    private static hasTopicDrift(output: string, originalInput: string): boolean {
        const inputKeywords = this.extractKeywords(originalInput);
        const outputKeywords = this.extractKeywords(output);

        const relevantKeywords = inputKeywords.filter(keyword =>
            outputKeywords.includes(keyword)
        ).length;

        return inputKeywords.length > 0 && (relevantKeywords / inputKeywords.length) < 0.3;
    }

    private static countComplexTerms(output: string): number {
        const complexTerms = [
            'methodology', 'infrastructure', 'architecture', 'implementation',
            'optimization', 'scalability', 'integration', 'configuration'
        ];

        return complexTerms.filter(term =>
            output.toLowerCase().includes(term)
        ).length;
    }

    private static hasGoodStructure(output: string): boolean {
        // فحص وجود عناوين وفقرات منظمة
        const hasHeaders = /^#+\s/.test(output) || output.includes('##');
        const hasParagraphs = output.split('\n\n').length >= 2;

        return hasHeaders && hasParagraphs;
    }

    private static hasLogicalFlow(output: string): boolean {
        // فحص التدفق المنطقي - تنفيذ مبسط
        const sections = output.split(/^#+\s/m);
        return sections.length >= 2; // وجود أقسام متعددة يشير للتنظيم
    }

    private static findMissingContent(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): QualityIssue[] {
        const issues: QualityIssue[] = [];

        // فحص المتطلبات غير المغطاة
        contextAnalysis.specificRequirements.forEach(requirement => {
            if (!this.isRequirementCovered(output, requirement)) {
                issues.push({
                    type: 'missing_content',
                    severity: 'high',
                    description: `المتطلب التالي غير مغطى: ${requirement}`,
                    suggestion: `أضف محتوى يغطي: ${requirement}`
                });
            }
        });

        return issues;
    }

    private static findUnclearLanguage(output: string, contextAnalysis: ContextAnalysisResult): QualityIssue[] {
        const issues: QualityIssue[] = [];

        // فحص الجمل الطويلة جداً
        const sentences = output.split(/[.!?]+/);
        sentences.forEach((sentence, index) => {
            const wordCount = sentence.split(/\s+/).length;
            if (wordCount > 30) {
                issues.push({
                    type: 'unclear_language',
                    severity: 'medium',
                    description: `الجملة رقم ${index + 1} طويلة جداً (${wordCount} كلمة)`,
                    suggestion: 'قسم الجملة إلى جمل أقصر وأوضح'
                });
            }
        });

        return issues;
    }

    private static findStructureIssues(output: string): QualityIssue[] {
        const issues: QualityIssue[] = [];

        // فحص عدم وجود عناوين
        if (!/^#+\s/.test(output) && !output.includes('##')) {
            issues.push({
                type: 'poor_structure',
                severity: 'medium',
                description: 'المحتوى يفتقر للعناوين التنظيمية',
                suggestion: 'أضف عناوين واضحة لتنظيم المحتوى'
            });
        }

        return issues;
    }

    private static findIrrelevantContent(output: string, originalInput: string): QualityIssue[] {
        const issues: QualityIssue[] = [];

        // فحص الانحراف عن الموضوع
        if (this.hasTopicDrift(output, originalInput)) {
            issues.push({
                type: 'irrelevant_content',
                severity: 'high',
                description: 'المحتوى يحتوي على معلومات غير ذات صلة بالموضوع الأصلي',
                suggestion: 'ركز على الموضوع الأساسي وأزل المعلومات غير ذات الصلة'
            });
        }

        return issues;
    }
}
