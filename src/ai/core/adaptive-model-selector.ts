/**
 * نظام اختيار النماذج التكيفي
 * يختار أفضل نموذج AI بناءً على نوع المهمة والسياق
 */

import { defaultModel, imageGenerationModel, proModel } from '@/ai/config/models';
import { ModelConfigSchema, ModelSelectionCriteriaSchema, TaskTypeSchema, type ModelConfig, type ModelSelectionCriteria } from '../schemas/intelligent-system';
import { ContextAnalysisResult } from './context-analyzer';
import { z } from 'zod';

export class AdaptiveModelSelector {

    /**
     * اختيار النموذج الأمثل بناءً على السياق والمتطلبات
     */
    static selectOptimalModel(
        contextAnalysis: ContextAnalysisResult,
        taskType: z.infer<typeof TaskTypeSchema>,
        additionalCriteria?: Partial<ModelSelectionCriteria>
    ): ModelConfig {

        const criteria = this.buildSelectionCriteria(contextAnalysis, taskType, additionalCriteria);
        const modelConfig = this.evaluateModels(criteria);

        return modelConfig;
    }

    /**
     * بناء معايير الاختيار
     */
    private static buildSelectionCriteria(
        contextAnalysis: ContextAnalysisResult,
        taskType: z.infer<typeof TaskTypeSchema>,
        additionalCriteria?: Partial<ModelSelectionCriteria>
    ): ModelSelectionCriteria {

        // تحديد تعقيد المحتوى
        const contentComplexity = this.mapComplexityLevel(contextAnalysis.complexityLevel);

        // تحديد طول المخرجات المتوقع
        const outputLength = this.estimateOutputLength(contextAnalysis, taskType);

        // تحديد متطلبات الدقة
        const accuracyRequirement = this.determineAccuracyRequirement(contextAnalysis, taskType);

        // تحديد متطلبات السرعة
        const speedRequirement = this.determineSpeedRequirement(contextAnalysis, taskType);

        // حساب حجم السياق
        const contextSize = this.calculateContextSize(contextAnalysis);

        // تحديد متطلبات اللغة
        const languageRequirement = this.determineLanguageRequirement(contextAnalysis);

        const criteriaObject = {
            taskType,
            contentComplexity,
            outputLength,
            accuracyRequirement,
            speedRequirement,
            contextSize,
            languageRequirement,
            ...additionalCriteria
        };
        
        // Validate with Zod before returning
        return ModelSelectionCriteriaSchema.parse(criteriaObject);
    }

    /**
     * تقييم النماذج المتاحة واختيار الأفضل
     */
    private static evaluateModels(criteria: ModelSelectionCriteria): ModelConfig {
        const availableModels = this.getAvailableModels();
        let bestModel = availableModels[0];
        let bestScore = 0;

        for (const model of availableModels) {
            const score = this.scoreModel(model, criteria);
            if (score > bestScore) {
                bestScore = score;
                bestModel = model;
            }
        }

        return this.configureModel(bestModel, criteria);
    }

    /**
     * الحصول على النماذج المتاحة
     */
    private static getAvailableModels() {
        return [
            {
                id: 'gemini-2.0-flash',
                name: 'Gemini 2.0 Flash',
                strengths: ['speed', 'efficiency', 'general_purpose'],
                weaknesses: ['complex_reasoning'],
                maxTokens: 8192,
                languages: ['ar', 'en', 'multilingual'],
                costEfficiency: 'high'
            },
            {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                strengths: ['complex_reasoning', 'accuracy', 'creative_tasks', 'long_context'],
                weaknesses: ['speed', 'cost'],
                maxTokens: 32768,
                languages: ['ar', 'en', 'multilingual'],
                costEfficiency: 'medium'
            },
            {
                id: 'gemini-2.0-flash-preview-image-generation',
                name: 'Gemini Image Generation',
                strengths: ['image_generation', 'visual_content'],
                weaknesses: ['text_only_tasks'],
                maxTokens: 4096,
                languages: ['en'],
                costEfficiency: 'medium'
            }
        ];
    }

    /**
     * تسجيل النموذج بناءً على المعايير
     */
    private static scoreModel(model: any, criteria: ModelSelectionCriteria): number {
        let score = 0;

        // تقييم نوع المهمة
        switch (criteria.taskType) {
            case 'creative':
            case 'generation':
                if (model.strengths.includes('creative_tasks')) score += 30;
                if (model.strengths.includes('general_purpose')) score += 20;
                break;
            case 'analysis':
            case 'technical':
                if (model.strengths.includes('complex_reasoning')) score += 30;
                if (model.strengths.includes('accuracy')) score += 25;
                break;
            case 'translation':
                if (model.languages.includes('multilingual')) score += 25;
                if (model.strengths.includes('accuracy')) score += 20;
                break;
            case 'improvement':
                if (model.strengths.includes('complex_reasoning')) score += 25;
                if (model.strengths.includes('accuracy')) score += 20;
                break;
        }

        // تقييم تعقيد المحتوى
        switch (criteria.contentComplexity) {
            case 'expert':
            case 'high':
                if (model.strengths.includes('complex_reasoning')) score += 25;
                if (model.weaknesses.includes('complex_reasoning')) score -= 20;
                break;
            case 'low':
            case 'medium':
                if (model.strengths.includes('general_purpose')) score += 15;
                if (model.strengths.includes('speed')) score += 10;
                break;
        }

        // تقييم متطلبات الدقة
        switch (criteria.accuracyRequirement) {
            case 'critical':
                if (model.strengths.includes('accuracy')) score += 30;
                if (model.weaknesses.includes('accuracy')) score -= 25;
                break;
            case 'high':
                if (model.strengths.includes('accuracy')) score += 20;
                break;
            case 'standard':
                if (model.strengths.includes('general_purpose')) score += 10;
                break;
        }

        // تقييم متطلبات السرعة
        switch (criteria.speedRequirement) {
            case 'fast':
                if (model.strengths.includes('speed')) score += 25;
                if (model.weaknesses.includes('speed')) score -= 20;
                break;
            case 'balanced':
                if (model.strengths.includes('efficiency')) score += 15;
                break;
            case 'quality_first':
                if (model.strengths.includes('accuracy')) score += 20;
                if (model.strengths.includes('complex_reasoning')) score += 15;
                break;
        }

        // تقييم طول المخرجات
        switch (criteria.outputLength) {
            case 'very_long':
                if (model.maxTokens >= 32000) score += 20;
                if (model.strengths.includes('long_context')) score += 15;
                break;
            case 'long':
                if (model.maxTokens >= 16000) score += 15;
                break;
            case 'medium':
            case 'short':
                if (model.maxTokens >= 8000) score += 10;
                break;
        }

        // تقييم حجم السياق
        if (criteria.contextSize > 20000 && model.strengths.includes('long_context')) {
            score += 20;
        }

        // تقييم متطلبات اللغة
        if (criteria.languageRequirement === 'multilingual' && model.languages.includes('multilingual')) {
            score += 15;
        } else if (model.languages.includes(criteria.languageRequirement)) {
            score += 10;
        }

        // تقييم الكفاءة من ناحية التكلفة
        switch (model.costEfficiency) {
            case 'high':
                score += 10;
                break;
            case 'medium':
                score += 5;
                break;
        }

        return score;
    }

    /**
     * تكوين النموذج المختار
     */
    private static configureModel(model: any, criteria: ModelSelectionCriteria): ModelConfig {
        let temperature = 0.7; // قيمة افتراضية
        let maxOutputTokens = 8192;
        let topP = 0.9;
        let topK = 40;

        // تعديل المعاملات حسب نوع المهمة
        switch (criteria.taskType) {
            case 'creative':
                temperature = 0.9;
                topP = 0.95;
                break;
            case 'analysis':
            case 'technical':
                temperature = 0.3;
                topP = 0.8;
                topK = 20;
                break;
            case 'translation':
                temperature = 0.2;
                topP = 0.7;
                break;
            case 'improvement':
                temperature = 0.5;
                topP = 0.85;
                break;
        }

        // تعديل حسب متطلبات الدقة
        switch (criteria.accuracyRequirement) {
            case 'critical':
                temperature = Math.min(temperature, 0.3);
                topP = Math.min(topP, 0.8);
                break;
            case 'high':
                temperature = Math.min(temperature, 0.5);
                break;
        }

        // تعديل طول المخرجات
        switch (criteria.outputLength) {
            case 'short':
                maxOutputTokens = 2048;
                break;
            case 'medium':
                maxOutputTokens = 4096;
                break;
            case 'long':
                maxOutputTokens = 8192;
                break;
            case 'very_long':
                maxOutputTokens = Math.min(16384, model.maxTokens);
                break;
        }

        // اختيار النموذج الفعلي
        let selectedModelId: string;
        switch (model.id) {
            case 'gemini-1.5-pro':
                selectedModelId = proModel.name;
                break;
            case 'gemini-2.0-flash-preview-image-generation':
                selectedModelId = imageGenerationModel;
                break;
            default:
                selectedModelId = defaultModel.name;
        }
        
        const configObject = {
            modelId: selectedModelId,
            temperature,
            maxOutputTokens,
            topP,
            topK,
            reasoning: this.generateSelectionReasoning(model, criteria)
        };

        return ModelConfigSchema.parse(configObject);
    }

    /**
     * Helper methods
     */
    private static mapComplexityLevel(level: ContextAnalysisResult['complexityLevel']): ModelSelectionCriteria['contentComplexity'] {
        switch (level) {
            case 'basic': return 'low';
            case 'intermediate': return 'medium';
            case 'advanced': return 'high';
            case 'expert': return 'expert';
            default: return 'medium';
        }
    }

    private static estimateOutputLength(
        contextAnalysis: ContextAnalysisResult,
        taskType: ModelSelectionCriteria['taskType']
    ): ModelSelectionCriteria['outputLength'] {

        // تقدير بناءً على نوع المهمة
        switch (taskType) {
            case 'generation':
                if (contextAnalysis.contentType === 'business') return 'long';
                if (contextAnalysis.contentType === 'technical') return 'very_long';
                return 'medium';
            case 'analysis':
                return contextAnalysis.complexityLevel === 'expert' ? 'long' : 'medium';
            case 'translation':
                return 'medium';
            case 'improvement':
                return 'medium';
            case 'creative':
                return 'long';
            case 'technical':
                return 'very_long';
            default:
                return 'medium';
        }
    }

    private static determineAccuracyRequirement(
        contextAnalysis: ContextAnalysisResult,
        taskType: ModelSelectionCriteria['taskType']
    ): ModelSelectionCriteria['accuracyRequirement'] {

        if (contextAnalysis.contentType === 'technical' || contextAnalysis.contentType === 'academic') {
            return 'critical';
        }

        if (taskType === 'analysis' || taskType === 'technical') {
            return 'high';
        }

        if (contextAnalysis.targetAudience === 'executive') {
            return 'high';
        }

        return 'standard';
    }

    private static determineSpeedRequirement(
        contextAnalysis: ContextAnalysisResult,
        taskType: ModelSelectionCriteria['taskType']
    ): ModelSelectionCriteria['speedRequirement'] {

        if (contextAnalysis.complexityLevel === 'expert' || taskType === 'analysis') {
            return 'quality_first';
        }

        if (contextAnalysis.complexityLevel === 'basic') {
            return 'fast';
        }

        return 'balanced';
    }

    private static calculateContextSize(contextAnalysis: ContextAnalysisResult): number {
        let size = 0;

        // حساب حجم الملفات الخارجية
        contextAnalysis.availableContext.files.forEach(file => {
            size += file.name.length * 100; // تقدير تقريبي
        });

        // حساب حجم المتطلبات والإرشادات
        size += contextAnalysis.specificRequirements.join(' ').length;
        size += contextAnalysis.availableContext.guidelines.join(' ').length;

        return size;
    }

    private static determineLanguageRequirement(contextAnalysis: ContextAnalysisResult): ModelSelectionCriteria['languageRequirement'] {
        if (contextAnalysis.language === 'ar' && contextAnalysis.culturalContext === 'middle-east') {
            return 'ar';
        }

        if (contextAnalysis.language === 'en') {
            return 'en';
        }

        return 'multilingual';
    }

    private static generateSelectionReasoning(model: any, criteria: ModelSelectionCriteria): string {
        let reasoning = `تم اختيار ${model.name} للأسباب التالية: `;

        const reasons: string[] = [];

        if (criteria.accuracyRequirement === 'critical' && model.strengths.includes('accuracy')) {
            reasons.push('دقة عالية مطلوبة');
        }

        if (criteria.contentComplexity === 'expert' && model.strengths.includes('complex_reasoning')) {
            reasons.push('تعامل مع المحتوى المعقد');
        }

        if (criteria.speedRequirement === 'fast' && model.strengths.includes('speed')) {
            reasons.push('سرعة في التنفيذ');
        }

        if (criteria.outputLength === 'very_long' && model.strengths.includes('long_context')) {
            reasons.push('دعم المخرجات الطويلة');
        }

        if (reasons.length === 0) {
            reasons.push('الأنسب للمهمة العامة');
        }

        return reasoning + reasons.join('، ');
    }

    /**
     * الحصول على تكوين النموذج الافتراضي
     */
    static getDefaultConfig(): ModelConfig {
        return {
            modelId: defaultModel.name,
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.9,
            topK: 40,
            reasoning: 'تكوين افتراضي للمهام العامة'
        };
    }

    /**
     * تحديث تكوين النموذج بناءً على النتائج السابقة
     */
    static adaptConfigBasedOnResults(
        currentConfig: ModelConfig,
        qualityScore: number,
        issues: string[]
    ): ModelConfig {
        const newConfig = { ...currentConfig };

        // إذا كانت الجودة منخفضة، قلل من temperature
        if (qualityScore < 70) {
            newConfig.temperature = Math.max(0.1, newConfig.temperature - 0.2);
            newConfig.reasoning += ' (تم تقليل الحرارة لتحسين الدقة)';
        }

        // إذا كان المحتوى غير مكتمل، زد من maxOutputTokens
        if (issues.includes('incomplete_content')) {
            newConfig.maxOutputTokens = Math.min(16384, newConfig.maxOutputTokens * 1.5);
            newConfig.reasoning += ' (تم زيادة طول المخرجات)';
        }

        return newConfig;
    }
}
