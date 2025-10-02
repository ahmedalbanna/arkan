/**
 * قوالب جاهزة لأقسام مقترح المشروع
 * تحتوي على قوالب محددة مسبقاً لكل نوع من أقسام المقترح
 */

import { type ProposalSectionType } from '@/services/intelligent-proposal-service';

export interface ProposalTemplate {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'professional' | 'academic' | 'technical' | 'business';
    language: 'ar' | 'en';
    structure: {
        outline: string[];
        keyPoints: string[];
        suggestedLength: number;
        tone: 'formal' | 'professional' | 'academic' | 'business';
    };
    content: {
        introduction: string;
        mainSections: string[];
        conclusion: string;
        guidelines: string[];
    };
    variables: {
        [key: string]: {
            type: 'text' | 'number' | 'list' | 'date';
            description: string;
            required: boolean;
            defaultValue?: any;
        };
    };
}

// قوالب الملخص التنفيذي
export const EXECUTIVE_SUMMARY_TEMPLATES: Record<string, ProposalTemplate> = {
    business_standard: {
        id: 'executive_summary_business_standard',
        name: 'ملخص تنفيذي تجاري قياسي',
        description: 'قالب احترافي للملخص التنفيذي للمشاريع التجارية',
        category: 'business',
        language: 'ar',
        structure: {
            outline: [
                'نظرة عامة على المشروع',
                'الأهداف الرئيسية',
                'الفوائد المتوقعة',
                'الميزانية والجدول الزمني',
                'التوصية'
            ],
            keyPoints: [
                'وضوح الهدف',
                'القيمة المضافة',
                'الجدوى الاقتصادية',
                'خطة التنفيذ'
            ],
            suggestedLength: 300,
            tone: 'professional'
        },
        content: {
            introduction: 'يهدف هذا المشروع إلى {{PROJECT_OBJECTIVE}} من خلال {{MAIN_APPROACH}}.',
            mainSections: [
                'نظرة عامة: {{PROJECT_DESCRIPTION}}',
                'الأهداف: تحقيق {{PRIMARY_GOALS}} خلال {{TIMELINE}}',
                'الفوائد: {{EXPECTED_BENEFITS}}',
                'الميزانية: {{BUDGET_SUMMARY}}',
                'التوصية: نوصي بالموافقة على هذا المشروع لأنه {{RECOMMENDATION_REASON}}'
            ],
            conclusion: 'نتطلع إلى الحصول على موافقتكم لبدء تنفيذ هذا المشروع الاستراتيجي.',
            guidelines: [
                'استخدم لغة واضحة ومباشرة',
                'ركز على الفوائد والنتائج',
                'اذكر الأرقام والإحصائيات المهمة',
                'اجعل الملخص مقنعاً وموجزاً'
            ]
        },
        variables: {
            PROJECT_OBJECTIVE: {
                type: 'text',
                description: 'الهدف الرئيسي للمشروع',
                required: true
            },
            MAIN_APPROACH: {
                type: 'text',
                description: 'النهج أو الطريقة الرئيسية',
                required: true
            },
            PROJECT_DESCRIPTION: {
                type: 'text',
                description: 'وصف موجز للمشروع',
                required: true
            },
            PRIMARY_GOALS: {
                type: 'list',
                description: 'الأهداف الأساسية',
                required: true
            },
            TIMELINE: {
                type: 'text',
                description: 'الإطار الزمني',
                required: true
            },
            EXPECTED_BENEFITS: {
                type: 'list',
                description: 'الفوائد المتوقعة',
                required: true
            },
            BUDGET_SUMMARY: {
                type: 'text',
                description: 'ملخص الميزانية',
                required: true
            },
            RECOMMENDATION_REASON: {
                type: 'text',
                description: 'سبب التوصية',
                required: true
            }
        }
    },

    technical_standard: {
        id: 'executive_summary_technical_standard',
        name: 'ملخص تنفيذي تقني',
        description: 'قالب متخصص للمشاريع التقنية والتكنولوجية',
        category: 'technical',
        language: 'ar',
        structure: {
            outline: [
                'التحدي التقني',
                'الحل المقترح',
                'التقنيات المستخدمة',
                'النتائج المتوقعة',
                'خطة التطوير'
            ],
            keyPoints: [
                'المشكلة التقنية',
                'الابتكار في الحل',
                'الجدوى التقنية',
                'قابلية التطبيق'
            ],
            suggestedLength: 350,
            tone: 'professional'
        },
        content: {
            introduction: 'يواجه قطاع {{INDUSTRY}} تحدياً في {{TECHNICAL_CHALLENGE}}، ونقترح حلاً تقنياً مبتكراً باستخدام {{TECHNOLOGY_STACK}}.',
            mainSections: [
                'التحدي: {{PROBLEM_STATEMENT}}',
                'الحل: تطوير {{SOLUTION_DESCRIPTION}} باستخدام {{TECHNOLOGIES}}',
                'المميزات: {{KEY_FEATURES}}',
                'النتائج: تحقيق {{EXPECTED_OUTCOMES}}',
                'التطوير: خطة تنفيذ على {{DEVELOPMENT_PHASES}} مراحل'
            ],
            conclusion: 'هذا المشروع سيحدث نقلة نوعية في {{IMPACT_AREA}} ويحقق عائداً استثمارياً مجدياً.',
            guidelines: [
                'اشرح التقنيات بطريقة مفهومة',
                'ركز على الابتكار والتميز',
                'اذكر المعايير التقنية',
                'وضح قابلية التوسع'
            ]
        },
        variables: {
            INDUSTRY: {
                type: 'text',
                description: 'القطاع أو الصناعة',
                required: true
            },
            TECHNICAL_CHALLENGE: {
                type: 'text',
                description: 'التحدي التقني المراد حله',
                required: true
            },
            TECHNOLOGY_STACK: {
                type: 'list',
                description: 'التقنيات المستخدمة',
                required: true
            },
            PROBLEM_STATEMENT: {
                type: 'text',
                description: 'بيان المشكلة',
                required: true
            },
            SOLUTION_DESCRIPTION: {
                type: 'text',
                description: 'وصف الحل',
                required: true
            },
            TECHNOLOGIES: {
                type: 'list',
                description: 'قائمة التقنيات',
                required: true
            },
            KEY_FEATURES: {
                type: 'list',
                description: 'المميزات الرئيسية',
                required: true
            },
            EXPECTED_OUTCOMES: {
                type: 'list',
                description: 'النتائج المتوقعة',
                required: true
            },
            DEVELOPMENT_PHASES: {
                type: 'number',
                description: 'عدد مراحل التطوير',
                required: true
            },
            IMPACT_AREA: {
                type: 'text',
                description: 'مجال التأثير',
                required: true
            }
        }
    }
};

// قوالب وصف المشروع
export const PROJECT_DESCRIPTION_TEMPLATES: Record<string, ProposalTemplate> = {
    comprehensive_standard: {
        id: 'project_description_comprehensive',
        name: 'وصف مشروع شامل',
        description: 'قالب شامل لوصف المشروع بالتفصيل',
        category: 'professional',
        language: 'ar',
        structure: {
            outline: [
                'خلفية المشروع',
                'الأهداف والغايات',
                'النطاق والحدود',
                'المنهجية',
                'الموارد المطلوبة'
            ],
            keyPoints: [
                'السياق والخلفية',
                'الأهداف الواضحة',
                'نطاق العمل',
                'المنهجية المتبعة'
            ],
            suggestedLength: 500,
            tone: 'professional'
        },
        content: {
            introduction: 'يأتي هذا المشروع استجابة لـ {{PROJECT_CONTEXT}} ويهدف إلى {{MAIN_PURPOSE}}.',
            mainSections: [
                'الخلفية: {{BACKGROUND_INFO}}',
                'الأهداف: {{PROJECT_OBJECTIVES}}',
                'النطاق: يشمل المشروع {{SCOPE_AREAS}} ويستثني {{EXCLUSIONS}}',
                'المنهجية: سنتبع منهجية {{METHODOLOGY}} لضمان {{QUALITY_ASSURANCE}}',
                'الموارد: يتطلب المشروع {{REQUIRED_RESOURCES}}'
            ],
            conclusion: 'هذا المشروع سيحقق {{PROJECT_IMPACT}} ويساهم في {{STRATEGIC_ALIGNMENT}}.',
            guidelines: [
                'وضح السياق والحاجة للمشروع',
                'حدد الأهداف بطريقة قابلة للقياس',
                'اذكر ما يشمله وما لا يشمله المشروع',
                'اشرح المنهجية المتبعة'
            ]
        },
        variables: {
            PROJECT_CONTEXT: {
                type: 'text',
                description: 'السياق أو الحاجة للمشروع',
                required: true
            },
            MAIN_PURPOSE: {
                type: 'text',
                description: 'الغرض الرئيسي',
                required: true
            },
            BACKGROUND_INFO: {
                type: 'text',
                description: 'معلومات الخلفية',
                required: true
            },
            PROJECT_OBJECTIVES: {
                type: 'list',
                description: 'أهداف المشروع',
                required: true
            },
            SCOPE_AREAS: {
                type: 'list',
                description: 'مجالات النطاق',
                required: true
            },
            EXCLUSIONS: {
                type: 'list',
                description: 'الاستثناءات',
                required: false
            },
            METHODOLOGY: {
                type: 'text',
                description: 'المنهجية المتبعة',
                required: true
            },
            QUALITY_ASSURANCE: {
                type: 'text',
                description: 'ضمان الجودة',
                required: true
            },
            REQUIRED_RESOURCES: {
                type: 'list',
                description: 'الموارد المطلوبة',
                required: true
            },
            PROJECT_IMPACT: {
                type: 'text',
                description: 'تأثير المشروع',
                required: true
            },
            STRATEGIC_ALIGNMENT: {
                type: 'text',
                description: 'التوافق الاستراتيجي',
                required: true
            }
        }
    }
};

// قوالب الأهداف والغايات
export const OBJECTIVES_TEMPLATES: Record<string, ProposalTemplate> = {
    smart_objectives: {
        id: 'objectives_smart_framework',
        name: 'أهداف SMART',
        description: 'قالب لكتابة الأهداف وفق إطار SMART',
        category: 'professional',
        language: 'ar',
        structure: {
            outline: [
                'الهدف العام',
                'الأهداف المحددة',
                'المؤشرات القابلة للقياس',
                'الجدول الزمني',
                'النتائج المتوقعة'
            ],
            keyPoints: [
                'محدد (Specific)',
                'قابل للقياس (Measurable)',
                'قابل للتحقيق (Achievable)',
                'ذو صلة (Relevant)',
                'محدد زمنياً (Time-bound)'
            ],
            suggestedLength: 400,
            tone: 'professional'
        },
        content: {
            introduction: 'يسعى هذا المشروع لتحقيق {{OVERALL_GOAL}} من خلال مجموعة من الأهداف المحددة والقابلة للقياس.',
            mainSections: [
                'الهدف العام: {{GENERAL_OBJECTIVE}}',
                'الأهداف المحددة: {{SPECIFIC_OBJECTIVES}}',
                'مؤشرات النجاح: {{SUCCESS_METRICS}}',
                'الإطار الزمني: {{TIMELINE_BREAKDOWN}}',
                'النتائج المتوقعة: {{EXPECTED_DELIVERABLES}}'
            ],
            conclusion: 'تحقيق هذه الأهداف سيؤدي إلى {{ULTIMATE_IMPACT}} ويساهم في {{ORGANIZATIONAL_GOALS}}.',
            guidelines: [
                'اجعل كل هدف محدداً وواضحاً',
                'حدد مؤشرات قابلة للقياس',
                'تأكد من واقعية الأهداف',
                'اربط الأهداف بالاستراتيجية العامة'
            ]
        },
        variables: {
            OVERALL_GOAL: {
                type: 'text',
                description: 'الهدف العام للمشروع',
                required: true
            },
            GENERAL_OBJECTIVE: {
                type: 'text',
                description: 'الهدف العام المفصل',
                required: true
            },
            SPECIFIC_OBJECTIVES: {
                type: 'list',
                description: 'الأهداف المحددة',
                required: true
            },
            SUCCESS_METRICS: {
                type: 'list',
                description: 'مؤشرات النجاح',
                required: true
            },
            TIMELINE_BREAKDOWN: {
                type: 'text',
                description: 'تفصيل الجدول الزمني',
                required: true
            },
            EXPECTED_DELIVERABLES: {
                type: 'list',
                description: 'المخرجات المتوقعة',
                required: true
            },
            ULTIMATE_IMPACT: {
                type: 'text',
                description: 'التأثير النهائي',
                required: true
            },
            ORGANIZATIONAL_GOALS: {
                type: 'text',
                description: 'الأهداف التنظيمية',
                required: true
            }
        }
    }
};

// قوالب المنهجية
export const METHODOLOGY_TEMPLATES: Record<string, ProposalTemplate> = {
    agile_methodology: {
        id: 'methodology_agile',
        name: 'منهجية أجايل',
        description: 'قالب لشرح منهجية أجايل في إدارة المشاريع',
        category: 'technical',
        language: 'ar',
        structure: {
            outline: [
                'نظرة عامة على المنهجية',
                'مراحل التطوير',
                'الأدوار والمسؤوليات',
                'أدوات إدارة المشروع',
                'ضمان الجودة'
            ],
            keyPoints: [
                'التطوير التكراري',
                'التعاون المستمر',
                'المرونة والتكيف',
                'التحسين المستمر'
            ],
            suggestedLength: 450,
            tone: 'professional'
        },
        content: {
            introduction: 'سنتبع منهجية أجايل في تنفيذ هذا المشروع لضمان {{AGILE_BENEFITS}} وتحقيق {{PROJECT_FLEXIBILITY}}.',
            mainSections: [
                'المنهجية: {{METHODOLOGY_OVERVIEW}}',
                'المراحل: تطوير تكراري عبر {{SPRINT_DURATION}} سبرينت بمدة {{SPRINT_LENGTH}}',
                'الأدوار: {{TEAM_ROLES}}',
                'الأدوات: استخدام {{PROJECT_TOOLS}}',
                'الجودة: {{QUALITY_ASSURANCE_PROCESS}}'
            ],
            conclusion: 'هذه المنهجية ستضمن تسليم {{DELIVERY_QUALITY}} في الوقت المحدد مع إمكانية التكيف مع {{CHANGE_REQUIREMENTS}}.',
            guidelines: [
                'اشرح فوائد المنهجية المختارة',
                'وضح مراحل التنفيذ',
                'حدد الأدوار والمسؤوليات',
                'اذكر أدوات إدارة المشروع'
            ]
        },
        variables: {
            AGILE_BENEFITS: {
                type: 'list',
                description: 'فوائد منهجية أجايل',
                required: true
            },
            PROJECT_FLEXIBILITY: {
                type: 'text',
                description: 'مرونة المشروع',
                required: true
            },
            METHODOLOGY_OVERVIEW: {
                type: 'text',
                description: 'نظرة عامة على المنهجية',
                required: true
            },
            SPRINT_DURATION: {
                type: 'number',
                description: 'عدد السبرينت',
                required: true
            },
            SPRINT_LENGTH: {
                type: 'text',
                description: 'مدة السبرينت',
                required: true
            },
            TEAM_ROLES: {
                type: 'list',
                description: 'أدوار الفريق',
                required: true
            },
            PROJECT_TOOLS: {
                type: 'list',
                description: 'أدوات المشروع',
                required: true
            },
            QUALITY_ASSURANCE_PROCESS: {
                type: 'text',
                description: 'عملية ضمان الجودة',
                required: true
            },
            DELIVERY_QUALITY: {
                type: 'text',
                description: 'جودة التسليم',
                required: true
            },
            CHANGE_REQUIREMENTS: {
                type: 'text',
                description: 'متطلبات التغيير',
                required: true
            }
        }
    }
};

// قوالب الميزانية والتكاليف
export const BUDGET_TEMPLATES: Record<string, ProposalTemplate> = {
    detailed_budget: {
        id: 'budget_detailed_breakdown',
        name: 'ميزانية مفصلة',
        description: 'قالب شامل لتفصيل ميزانية المشروع',
        category: 'business',
        language: 'ar',
        structure: {
            outline: [
                'إجمالي الميزانية',
                'تكاليف الموارد البشرية',
                'التكاليف التقنية',
                'التكاليف التشغيلية',
                'الطوارئ والمخاطر'
            ],
            keyPoints: [
                'شفافية التكاليف',
                'تفصيل دقيق',
                'تبرير المصروفات',
                'إدارة المخاطر المالية'
            ],
            suggestedLength: 400,
            tone: 'professional'
        },
        content: {
            introduction: 'تبلغ الميزانية الإجمالية للمشروع {{TOTAL_BUDGET}} ريال سعودي، موزعة على {{BUDGET_CATEGORIES}} فئات رئيسية.',
            mainSections: [
                'الإجمالي: {{TOTAL_AMOUNT}}',
                'الموارد البشرية: {{HR_COSTS}} ({{HR_PERCENTAGE}}%)',
                'التقنية: {{TECH_COSTS}} ({{TECH_PERCENTAGE}}%)',
                'التشغيل: {{OPERATIONAL_COSTS}} ({{OP_PERCENTAGE}}%)',
                'الطوارئ: {{CONTINGENCY_COSTS}} ({{CONTINGENCY_PERCENTAGE}}%)'
            ],
            conclusion: 'هذه الميزانية محسوبة بدقة وتشمل {{BUDGET_INCLUSIONS}} مع مراعاة {{RISK_FACTORS}}.',
            guidelines: [
                'قدم تفصيلاً واضحاً للتكاليف',
                'برر كل بند من بنود الميزانية',
                'اشمل هامش للطوارئ',
                'وضح طريقة حساب التكاليف'
            ]
        },
        variables: {
            TOTAL_BUDGET: {
                type: 'number',
                description: 'إجمالي الميزانية',
                required: true
            },
            BUDGET_CATEGORIES: {
                type: 'number',
                description: 'عدد فئات الميزانية',
                required: true
            },
            TOTAL_AMOUNT: {
                type: 'number',
                description: 'المبلغ الإجمالي',
                required: true
            },
            HR_COSTS: {
                type: 'number',
                description: 'تكاليف الموارد البشرية',
                required: true
            },
            HR_PERCENTAGE: {
                type: 'number',
                description: 'نسبة تكاليف الموارد البشرية',
                required: true
            },
            TECH_COSTS: {
                type: 'number',
                description: 'التكاليف التقنية',
                required: true
            },
            TECH_PERCENTAGE: {
                type: 'number',
                description: 'نسبة التكاليف التقنية',
                required: true
            },
            OPERATIONAL_COSTS: {
                type: 'number',
                description: 'التكاليف التشغيلية',
                required: true
            },
            OP_PERCENTAGE: {
                type: 'number',
                description: 'نسبة التكاليف التشغيلية',
                required: true
            },
            CONTINGENCY_COSTS: {
                type: 'number',
                description: 'تكاليف الطوارئ',
                required: true
            },
            CONTINGENCY_PERCENTAGE: {
                type: 'number',
                description: 'نسبة تكاليف الطوارئ',
                required: true
            },
            BUDGET_INCLUSIONS: {
                type: 'list',
                description: 'ما تشمله الميزانية',
                required: true
            },
            RISK_FACTORS: {
                type: 'list',
                description: 'عوامل المخاطر',
                required: true
            }
        }
    }
};

// مجموعة شاملة من جميع القوالب
export const PROPOSAL_SECTION_TEMPLATES: Record<ProposalSectionType, Record<string, ProposalTemplate>> = {
    executive_summary: EXECUTIVE_SUMMARY_TEMPLATES,
    project_overview: PROJECT_DESCRIPTION_TEMPLATES,
    objectives_goals: OBJECTIVES_TEMPLATES,
    methodology: METHODOLOGY_TEMPLATES,
    budget_costs: BUDGET_TEMPLATES,

    // قوالب أخرى (يمكن إضافتها لاحقاً)
    timeline_schedule: {},
    team_qualifications: {},
    risk_management: {},
    deliverables: {},
    evaluation_metrics: {},
    sustainability: {},
    references: {},
    appendices: {}
};

// دالة للحصول على قالب محدد
export function getTemplate(sectionType: ProposalSectionType, templateId: string): ProposalTemplate | null {
    const sectionTemplates = PROPOSAL_SECTION_TEMPLATES[sectionType];
    return sectionTemplates?.[templateId] || null;
}

// دالة للحصول على جميع قوالب قسم معين
export function getSectionTemplates(sectionType: ProposalSectionType): ProposalTemplate[] {
    const sectionTemplates = PROPOSAL_SECTION_TEMPLATES[sectionType];
    if (!sectionTemplates) {
        return [];
    }

    // تصفية القيم غير المعرفة أو الفارغة
    return Object.values(sectionTemplates).filter((template): template is ProposalTemplate => {
        return template && typeof template === 'object' && 'id' in template && 'description' in template;
    });
}

// دالة لتطبيق قالب مع المتغيرات
export function applyTemplate(template: ProposalTemplate, variables: Record<string, any>): string {
    let content = template.content.introduction + '\n\n';

    // إضافة الأقسام الرئيسية
    template.content.mainSections.forEach(section => {
        content += section + '\n\n';
    });

    // إضافة الخاتمة
    content += template.content.conclusion;

    // استبدال المتغيرات
    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        let replacement = '';

        if (Array.isArray(value)) {
            replacement = value.map((item, index) => `${index + 1}. ${item}`).join('\n');
        } else {
            replacement = String(value);
        }

        content = content.replace(new RegExp(placeholder, 'g'), replacement);
    });

    return content;
}

// دالة للتحقق من صحة المتغيرات المطلوبة
export function validateTemplateVariables(template: ProposalTemplate, variables: Record<string, any>): {
    isValid: boolean;
    missingRequired: string[];
    invalidTypes: string[];
} {
    const missingRequired: string[] = [];
    const invalidTypes: string[] = [];

    Object.entries(template.variables).forEach(([key, config]) => {
        if (config.required && !variables[key]) {
            missingRequired.push(key);
        }

        if (variables[key]) {
            const value = variables[key];
            switch (config.type) {
                case 'number':
                    if (typeof value !== 'number') invalidTypes.push(key);
                    break;
                case 'list':
                    if (!Array.isArray(value)) invalidTypes.push(key);
                    break;
                case 'text':
                    if (typeof value !== 'string') invalidTypes.push(key);
                    break;
            }
        }
    });

    return {
        isValid: missingRequired.length === 0 && invalidTypes.length === 0,
        missingRequired,
        invalidTypes
    };
}

// دالة لإنشاء قالب مخصص
export function createCustomTemplate(
    id: string,
    name: string,
    sectionType: ProposalSectionType,
    structure: ProposalTemplate['structure'],
    content: ProposalTemplate['content'],
    variables: ProposalTemplate['variables']
): ProposalTemplate {
    return {
        id,
        name,
        description: `قالب مخصص لـ ${name}`,
        category: 'basic',
        language: 'ar',
        structure,
        content,
        variables
    };
}
