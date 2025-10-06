/**
 * Hook للتحقق الذكي المحسن من مدخلات التقرير
 * يوفر تحليل شامل وتوصيات ذكية
 */

'use client';

import type { SectionName } from '@/ai/schemas';
import { ValidationIssue, ValidationResult } from '@/components/ui/validation-components';
import { useMemo } from 'react';

export interface SmartValidationConfig {
    operationType: 'single-section' | 'complete-report';
    sectionToGenerate?: SectionName;
    sectionsToGenerate?: SectionName[];
    proposal?: any;
    projectPlan?: any;
    guidelines?: string[];
    contextFiles?: Array<{ fileName: string; content: string; type: string }>;
    otherSections?: Record<string, string>;
    exampleFiles?: Array<{ fileName: string; content: string }>;
    instructionText?: string;
}

/**
 * Hook للتحقق الذكي المحسن من مدخلات التقرير
 */
export function useSmartValidation(config: SmartValidationConfig): ValidationResult {
    return useMemo(() => {
        const validation: ValidationResult = {
            isValid: true,
            score: 0,
            issues: [],
            recommendations: [],
            canGenerate: false
        };

        let score = 0;
        const maxScore = 100;

        // 1. التحقق من نوع العملية (10 نقاط)
        if (!config.operationType) {
            validation.issues.push({
                type: 'error',
                title: 'نوع العملية مطلوب',
                description: 'يجب تحديد نوع العملية (قسم فردي أو تقرير كامل)',
                action: 'اختر نوع العملية من الأعلى',
                priority: 'high'
            });
            validation.isValid = false;
        } else {
            score += 10;
        }

        // 2. التحقق من الأقسام المطلوبة (15 نقطة)
        if (config.operationType === 'single-section') {
            if (!config.sectionToGenerate) {
                validation.issues.push({
                    type: 'error',
                    title: 'يجب اختيار القسم',
                    description: 'اختر القسم الذي تريد توليده من قائمة الأقسام المتاحة',
                    action: 'اختر قسماً من القائمة',
                    priority: 'high'
                });
                validation.isValid = false;
            } else {
                score += 15;
            }
        } else if (config.operationType === 'complete-report') {
            if (!config.sectionsToGenerate || config.sectionsToGenerate.length === 0) {
                validation.issues.push({
                    type: 'error',
                    title: 'يجب اختيار الأقسام',
                    description: 'اختر الأقسام التي تريد تضمينها في التقرير الكامل',
                    action: 'اختر أقساماً من قائمة الأقسام',
                    priority: 'high'
                });
                validation.isValid = false;
            } else {
                score += 15;
                // نقاط إضافية للأقسام المتعددة
                score += Math.min(config.sectionsToGenerate.length * 2, 10);
            }
        }

        // 3. تحليل جودة السياق (40 نقطة)
        const contextAnalysis = analyzeContextQuality(config);
        score += contextAnalysis.score;
        validation.recommendations.push(...contextAnalysis.recommendations);
        validation.issues.push(...contextAnalysis.issues);

        // 4. تحليل التوجيهات والتعليمات (20 نقطة)
        const guidelinesAnalysis = analyzeGuidelines(config);
        score += guidelinesAnalysis.score;
        validation.recommendations.push(...guidelinesAnalysis.recommendations);

        // 5. تحليل التبعيات والتناسق (15 نقطة)
        const consistencyAnalysis = analyzeConsistency(config);
        score += consistencyAnalysis.score;
        validation.recommendations.push(...consistencyAnalysis.recommendations);

        // تحديد النتيجة النهائية
        validation.score = Math.min(Math.max(score, 0), maxScore);
        validation.canGenerate = validation.isValid && validation.score >= 30;

        // إضافة توصيات بناءً على النتيجة
        if (validation.score < 30) {
            validation.issues.push({
                type: 'error',
                title: 'جودة المدخلات منخفضة جداً',
                description: 'المدخلات الحالية غير كافية لتوليد تقرير عالي الجودة',
                action: 'أضف المزيد من السياق والمعلومات',
                priority: 'high'
            });
        } else if (validation.score < 60) {
            validation.issues.push({
                type: 'warning',
                title: 'يمكن تحسين جودة المدخلات',
                description: 'النتائج ستكون مقبولة ولكن يمكن تحسينها بشكل كبير',
                action: 'راجع التوصيات أدناه',
                priority: 'medium'
            });
        } else if (validation.score >= 80) {
            validation.recommendations.unshift('🎉 ممتاز! المدخلات عالية الجودة وستنتج تقريراً ممتازاً');
        }

        return validation;
    }, [config]);
}

/**
 * تحليل جودة السياق المتاح
 */
function analyzeContextQuality(config: SmartValidationConfig): {
    score: number;
    recommendations: string[];
    issues: ValidationIssue[];
} {
    let score = 0;
    const recommendations: string[] = [];
    const issues: ValidationIssue[] = [];

    const hasProposal = config.proposal && Object.keys(config.proposal).length > 0;
    const hasProjectPlan = config.projectPlan && Object.keys(config.projectPlan).length > 0;
    const hasContextFiles = config.contextFiles && config.contextFiles.length > 0;
    const hasOtherSections = config.otherSections && Object.keys(config.otherSections).length > 0;
    const hasExampleFiles = config.exampleFiles && config.exampleFiles.length > 0;

    // مقترح المشروع (15 نقطة)
    if (hasProposal) {
        score += 15;
        recommendations.push('✅ مقترح المشروع متوفر - سيحسن جودة التوليد بشكل كبير');
    } else {
        recommendations.push('💡 إضافة مقترح مشروع سيحسن جودة النتائج بشكل كبير');
    }

    // خطة المشروع (10 نقاط)
    if (hasProjectPlan) {
        score += 10;
        recommendations.push('✅ خطة المشروع متوفرة - ستضيف هيكلة أفضل للتقرير');
    } else {
        recommendations.push('💡 خطة المشروع ستضيف هيكلة أفضل للتقرير');
    }

    // ملفات السياق (10 نقاط)
    if (hasContextFiles) {
        score += 10;
        recommendations.push(`✅ ${config.contextFiles?.length} ملف سياق - سيثري المحتوى بمعلومات إضافية`);
    } else {
        recommendations.push('💡 ملفات السياق ستثري المحتوى بمعلومات إضافية');
    }

    // الأقسام السابقة (5 نقاط)
    if (hasOtherSections) {
        score += 5;
        recommendations.push(`✅ ${Object.keys(config.otherSections || {}).length} قسم سابق - سيضمن التناسق`);
    }

    // ملفات الأمثلة (5 نقاط)
    if (hasExampleFiles) {
        score += 5;
        recommendations.push(`✅ ${config.exampleFiles?.length} ملف مثال - سيحسن الأسلوب والهيكلة`);
    } else {
        recommendations.push('💡 ملفات الأمثلة ستساعد في محاكاة الأسلوب المطلوب');
    }

    // التحقق من وجود أي سياق
    const hasAnyContext = hasProposal || hasProjectPlan || hasContextFiles || hasOtherSections || hasExampleFiles;
    if (!hasAnyContext) {
        issues.push({
            type: 'error',
            title: 'معلومات السياق مطلوبة',
            description: 'يجب توفير واحد على الأقل من: مقترح المشروع، خطة المشروع، ملفات السياق، أقسام سابقة، أو ملفات الأمثلة',
            action: 'أضف معلومات في لوحة الإعدادات',
            priority: 'high'
        });
    }

    return { score, recommendations, issues };
}

/**
 * تحليل التوجيهات والتعليمات
 */
function analyzeGuidelines(config: SmartValidationConfig): {
    score: number;
    recommendations: string[];
} {
    let score = 0;
    const recommendations: string[] = [];

    // التوجيهات (10 نقاط)
    if (config.guidelines && config.guidelines.length > 0) {
        score += 10;
        recommendations.push(`✅ ${config.guidelines.length} توجيه - سيضمن الجودة والاتساق`);
    } else {
        recommendations.push('💡 التوجيهات ستساعد في توجيه النتائج حسب متطلباتك');
    }

    // التعليمات الإضافية (10 نقاط)
    if (config.instructionText && config.instructionText.trim().length > 0) {
        score += 10;
        recommendations.push('✅ تعليمات إضافية متوفرة - ستوفر تخصيص أفضل');
    } else {
        recommendations.push('💡 التعليمات الإضافية ستوفر تخصيص أفضل للنتائج');
    }

    return { score, recommendations };
}

/**
 * تحليل التناسق والتبعيات
 */
function analyzeConsistency(config: SmartValidationConfig): {
    score: number;
    recommendations: string[];
} {
    let score = 0;
    const recommendations: string[] = [];

    // تحليل تناسق الأقسام للتقارير الكاملة
    if (config.operationType === 'complete-report' && config.sectionsToGenerate) {
        const sections = config.sectionsToGenerate;

        // التحقق من وجود الأقسام الأساسية
        const essentialSections = ['introduction', 'conclusion'];
        const hasEssentialSections = essentialSections.every(section =>
            sections.includes(section as SectionName)
        );

        if (hasEssentialSections) {
            score += 10;
            recommendations.push('✅ الأقسام الأساسية متوفرة (مقدمة وخاتمة)');
        } else {
            recommendations.push('💡 تأكد من تضمين المقدمة والخاتمة في التقرير');
        }

        // التحقق من التسلسل المنطقي
        const logicalOrder = ['introduction', 'literatureReview', 'methodology', 'results', 'discussion', 'conclusion'];
        const orderedSections = sections.filter(section => logicalOrder.includes(section));

        if (orderedSections.length >= 3) {
            score += 5;
            recommendations.push('✅ تسلسل منطقي جيد للأقسام');
        } else {
            recommendations.push('💡 رتب الأقسام بترتيب منطقي (مقدمة → منهجية → نتائج → خاتمة)');
        }
    }

    return { score, recommendations };
}

/**
 * Hook لاقتراح التحسينات الذكية
 */
export function useSmartSuggestions(config: SmartValidationConfig) {
    return useMemo(() => {
        const suggestions: Array<{
            type: 'add' | 'improve' | 'fix';
            title: string;
            description: string;
            impact: 'high' | 'medium' | 'low';
        }> = [];

        // اقتراحات بناءً على نوع العملية
        if (config.operationType === 'single-section') {
            if (!config.proposal) {
                suggestions.push({
                    type: 'add',
                    title: 'أضف مقترح المشروع',
                    description: 'مقترح المشروع سيحسن جودة القسم المولد بشكل كبير',
                    impact: 'high'
                });
            }
        } else if (config.operationType === 'complete-report') {
            if (!config.projectPlan) {
                suggestions.push({
                    type: 'add',
                    title: 'أضف خطة المشروع',
                    description: 'خطة المشروع ستضمن هيكلة أفضل للتقرير الكامل',
                    impact: 'high'
                });
            }
        }

        // اقتراحات بناءً على السياق المتاح
        if (!config.contextFiles || config.contextFiles.length === 0) {
            suggestions.push({
                type: 'add',
                title: 'أضف ملفات السياق',
                description: 'ملفات السياق ستثري المحتوى بمعلومات إضافية',
                impact: 'medium'
            });
        }

        if (!config.exampleFiles || config.exampleFiles.length === 0) {
            suggestions.push({
                type: 'add',
                title: 'أضف ملفات أمثلة',
                description: 'ملفات الأمثلة ستساعد في محاكاة الأسلوب المطلوب',
                impact: 'medium'
            });
        }

        if (!config.guidelines || config.guidelines.length === 0) {
            suggestions.push({
                type: 'improve',
                title: 'أضف توجيهات مخصصة',
                description: 'التوجيهات ستساعد في توجيه النتائج حسب متطلباتك',
                impact: 'medium'
            });
        }

        return suggestions;
    }, [config]);
}
