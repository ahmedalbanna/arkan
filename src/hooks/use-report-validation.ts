/**
 * Hook للتحقق من صحة مدخلات التقرير الذكي
 * يوفر تحليل شامل للمعلومات المطلوبة والمفقودة
 */

import type { SectionName } from '@/ai/schemas/enums';
import { useMemo } from 'react';

export interface ValidationResult {
    isValid: boolean;
    missingInputs: string[];
    warnings: string[];
    recommendations: string[];
    canGenerate: boolean;
    requiredActions: RequiredAction[];
}

export interface RequiredAction {
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
}

export interface ReportValidationConfig {
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
 * Hook لتحليل صحة البيانات المدخلة للتقرير الذكي
 */
export function useReportValidation(config: ReportValidationConfig): ValidationResult {
    return useMemo(() => {
        const validation: ValidationResult = {
            isValid: true,
            missingInputs: [],
            warnings: [],
            recommendations: [],
            canGenerate: false,
            requiredActions: []
        };

        // 1. التحقق من نوع العملية
        if (!config.operationType) {
            validation.missingInputs.push('نوع العملية');
            validation.requiredActions.push({
                type: 'error',
                title: 'نوع العملية مطلوب',
                description: 'يجب تحديد نوع العملية (قسم فردي أو تقرير كامل)',
                action: 'اختر نوع العملية من الأعلى'
            });
            validation.isValid = false;
        }

        // 2. التحقق من الأقسام المطلوبة
        if (config.operationType === 'single-section') {
            if (!config.sectionToGenerate) {
                validation.missingInputs.push('القسم المطلوب');
                validation.requiredActions.push({
                    type: 'error',
                    title: 'يجب اختيار القسم',
                    description: 'اختر القسم الذي تريد توليده من قائمة الأقسام المتاحة',
                    action: 'اختر قسماً من القائمة'
                });
                validation.isValid = false;
            }
        } else if (config.operationType === 'complete-report') {
            if (!config.sectionsToGenerate || config.sectionsToGenerate.length === 0) {
                validation.missingInputs.push('أقسام التقرير');
                validation.requiredActions.push({
                    type: 'error',
                    title: 'يجب اختيار الأقسام',
                    description: 'اختر الأقسام التي تريد تضمينها في التقرير الكامل',
                    action: 'اختر أقساماً من قائمة الأقسام'
                });
                validation.isValid = false;
            }
        }

        // 3. التحقق من السياق المطلوب (حسب القاعدة في schema)
        const hasProposal = config.proposal && Object.keys(config.proposal).length > 0;
        const hasProjectPlan = config.projectPlan && Object.keys(config.projectPlan).length > 0;
        const hasContextFiles = config.contextFiles && config.contextFiles.length > 0;
        const hasOtherSections = config.otherSections && Object.keys(config.otherSections).length > 0;
        const hasExampleFiles = config.exampleFiles && config.exampleFiles.length > 0;
        const hasInstructionText = config.instructionText && config.instructionText.trim().length > 0;

        const hasRequiredContext = hasProposal || hasProjectPlan || hasContextFiles || hasOtherSections || hasExampleFiles;

        if (!hasRequiredContext) {
            validation.missingInputs.push('السياق');
            validation.requiredActions.push({
                type: 'error',
                title: 'معلومات السياق مطلوبة',
                description: 'يجب توفير واحد على الأقل من: مقترح المشروع، خطة المشروع، ملفات السياق، أقسام سابقة، أو ملفات الأمثلة',
                action: 'أضف معلومات في لوحة الإعدادات'
            });
            validation.isValid = false;
        }

        // 4. تحليل جودة المدخلات وتقديم التوصيات
        let inputQualityScore = 0;
        const maxScore = 10;

        if (hasProposal) {
            inputQualityScore += 3;
            validation.recommendations.push('✅ مقترح المشروع متوفر - سيحسن جودة التوليد');
        } else {
            validation.warnings.push('مقترح المشروع غير متوفر');
            validation.recommendations.push('💡 إضافة مقترح مشروع سيحسن جودة النتائج بشكل كبير');
        }

        if (hasProjectPlan) {
            inputQualityScore += 2;
            validation.recommendations.push('✅ خطة المشروع متوفرة - ستضيف هيكلة للتقرير');
        } else {
            validation.recommendations.push('💡 خطة المشروع ستضيف هيكلة أفضل للتقرير');
        }

        if (hasContextFiles) {
            inputQualityScore += 2;
            validation.recommendations.push(`✅ ${config.contextFiles?.length} ملف سياق - سيثري المحتوى`);
        } else {
            validation.recommendations.push('💡 ملفات السياق ستثري المحتوى بمعلومات إضافية');
        }

        if (config.guidelines && config.guidelines.length > 0) {
            inputQualityScore += 1;
            validation.recommendations.push(`✅ ${config.guidelines.length} توجيه - سيضمن الجودة`);
        } else {
            validation.recommendations.push('💡 التوجيهات ستساعد في توجيه النتائج حسب متطلباتك');
        }

        if (hasExampleFiles) {
            inputQualityScore += 1;
            validation.recommendations.push(`✅ ${config.exampleFiles?.length} ملف مثال - سيحسن الأسلوب`);
        } else {
            validation.recommendations.push('💡 ملفات الأمثلة ستساعد في محاكاة الأسلوب المطلوب');
        }

        if (hasInstructionText) {
            inputQualityScore += 1;
            validation.recommendations.push('✅ تعليمات إضافية متوفرة');
        }

        // 5. تحليل جودة المدخلات
        const qualityPercentage = (inputQualityScore / maxScore) * 100;

        if (qualityPercentage < 30) {
            validation.requiredActions.push({
                type: 'warning',
                title: 'جودة المدخلات منخفضة',
                description: `جودة المدخلات الحالية ${qualityPercentage.toFixed(0)}%. يُنصح بإضافة المزيد من السياق لتحسين النتائج`,
                action: 'أضف مقترح مشروع أو ملفات سياق'
            });
        } else if (qualityPercentage < 60) {
            validation.requiredActions.push({
                type: 'info',
                title: 'يمكن تحسين جودة المدخلات',
                description: `جودة المدخلات الحالية ${qualityPercentage.toFixed(0)}%. النتائج ستكون جيدة ولكن يمكن تحسينها`,
                action: 'أضف المزيد من السياق حسب التوصيات'
            });
        } else {
            validation.requiredActions.push({
                type: 'info',
                title: 'جودة المدخلات ممتازة',
                description: `جودة المدخلات ${qualityPercentage.toFixed(0)}%. النتائج ستكون عالية الجودة`,
            });
        }

        // 6. التحقق من التبعيات للتقارير الكاملة
        if (config.operationType === 'complete-report' && config.sectionsToGenerate) {
            // يمكن إضافة منطق التحقق من التبعيات هنا إذا لزم الأمر
            // هذا سيتم التعامل معه في المكون الرئيسي
        }

        // 7. تحديد إمكانية التوليد
        validation.canGenerate = validation.isValid && hasRequiredContext;

        return validation;
    }, [config]);
}

/**
 * Hook لإنشاء إعدادات افتراضية عندما لا تتوفر مقترحات
 */
export function useDefaultReportConfig() {
    return useMemo(() => ({
        defaultProjectInfo: {
            title: '',
            description: '',
            objectives: [],
            scope: '',
            methodology: '',
            timeline: ''
        },
        defaultGuidelines: [
            'استخدم اللغة العربية الفصحى',
            'اجعل المحتوى مهنياً ومناسباً للسياق الأكاديمي',
            'تأكد من التسلسل المنطقي للأفكار',
            'استخدم العناوين والفقرات لتنظيم المحتوى',
            'أضف أمثلة وتوضيحات عملية عند الضرورة'
        ],
        suggestedContextTypes: [
            {
                type: 'project-description',
                title: 'وصف المشروع',
                description: 'معلومات أساسية عن المشروع وأهدافه',
                placeholder: 'اكتب وصفاً مختصراً للمشروع وأهدافه الرئيسية...'
            },
            {
                type: 'requirements',
                title: 'المتطلبات',
                description: 'متطلبات النظام الوظيفية وغير الوظيفية',
                placeholder: 'اذكر المتطلبات الأساسية للنظام...'
            },
            {
                type: 'methodology',
                title: 'المنهجية',
                description: 'المنهجية المستخدمة في التطوير',
                placeholder: 'اذكر المنهجية والأدوات المستخدمة...'
            },
            {
                type: 'scope',
                title: 'نطاق المشروع',
                description: 'حدود وإطار المشروع',
                placeholder: 'حدد نطاق المشروع وما سيتم تغطيته...'
            }
        ]
    }), []);
}

/**
 * Hook لاقتراح البيانات المفقودة بناءً على نوع القسم
 */
export function useSectionRequirements(sectionName?: SectionName) {
    return useMemo(() => {
        if (!sectionName) return null;

        const requirements: Record<SectionName, {
            essential: string[];
            recommended: string[];
            examples: string[];
        }> = {
            'abstract': {
                essential: ['أهداف المشروع', 'النتائج الرئيسية', 'الاستنتاجات'],
                recommended: ['المنهجية المستخدمة', 'الإطار النظري', 'التوصيات'],
                examples: ['ملخص تنفيذي مشابه', 'هيكل الملخص المطلوب']
            },
            'introduction': {
                essential: ['موضوع المشروع', 'أهمية الموضوع', 'أهداف البحث'],
                recommended: ['خلفية الموضوع', 'مشكلة البحث', 'هيكل التقرير'],
                examples: ['مقدمات لمشاريع مشابهة', 'أسلوب الكتابة المطلوب']
            },
            'systemAnalysis': {
                essential: ['النظام الحالي', 'المتطلبات', 'التحليل'],
                recommended: ['أدوات التحليل', 'منهجية التحليل', 'الأهداف'],
                examples: ['نماذج تحليل النظم', 'أدوات UML']
            },
            'systemDesign': {
                essential: ['هيكل النظام', 'مكونات النظام', 'التفاعلات'],
                recommended: ['أنماط التصميم', 'قواعد البيانات', 'واجهات النظام'],
                examples: ['مخططات التصميم', 'هيكل معماري']
            },
            // يمكن إضافة المزيد حسب الحاجة
        } as any;

        return requirements[sectionName] || {
            essential: ['معلومات أساسية عن الموضوع'],
            recommended: ['السياق والخلفية', 'الأهداف', 'المنهجية'],
            examples: ['مراجع ذات صلة', 'أمثلة مشابهة']
        };
    }, [sectionName]);
}
