/**
 * برومبتات المخططات الذكية
 * مجموعة شاملة من البرومبتات المحسنة لتوليد مخططات PlantUML عالية الجودة
 */

import {
    IntelligentPromptBuilder
} from '@/ai/core';

// تعريف الأنواع محلياً
export type DiagramType = 'class' | 'sequence' | 'usecase' | 'activity' | 'component' | 'deployment' |
    'state' | 'object' | 'communication' | 'interaction' | 'timing' |
    'flowchart' | 'mindmap' | 'gantt' | 'network' | 'er' | 'wireframe';

export type DiagramComplexity = 'basic' | 'detailed' | 'comprehensive';

export interface DiagramStyle {
    theme: 'default' | 'modern' | 'minimal' | 'colorful';
    direction: 'top-bottom' | 'left-right' | 'bottom-top' | 'right-left';
    showDetails: boolean;
    includeNotes: boolean;
}

// أنواع البرومبتات
export type DiagramPromptType = 'system' | 'user' | 'context' | 'quality' | 'improvement';

// واجهة برومبت المخطط
export interface DiagramPrompt {
    type: DiagramPromptType;
    content: string;
    variables?: Record<string, any>;
    conditions?: string[];
}

// مجموعة برومبتات المخطط
export interface DiagramPromptSet {
    system: DiagramPrompt;
    user: DiagramPrompt;
    context?: DiagramPrompt;
    quality?: DiagramPrompt;
    improvement?: DiagramPrompt;
}

/**
 * البرومبت الأساسي للنظام
 */
const SYSTEM_BASE_PROMPT = `أنت خبير متخصص في تصميم وتوليد المخططات التقنية باستخدام PlantUML.

خبرتك تشمل:
- تصميم جميع أنواع مخططات UML والمخططات التقنية
- فهم المتطلبات التقنية والتجارية بعمق
- إنشاء مخططات واضحة ومفهومة ومفيدة
- تطبيق أفضل الممارسات في التصميم التقني
- دعم اللغتين العربية والإنجليزية

مبادئك في التصميم:
1. الوضوح والبساطة
2. الدقة التقنية
3. الفائدة العملية
4. الجمال البصري
5. سهولة الفهم

أنت تولد كود PlantUML صحيح ومحسن دائماً.`;

/**
 * برومبتات مخصصة لكل نوع مخطط
 */
export const DIAGRAM_PROMPT_TEMPLATES: Record<DiagramType, DiagramPromptSet> = {
    // مخطط الفئات (Class Diagram)
    'class': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات الفئات (Class Diagrams)
- تصميم هياكل الكلاسات والواجهات
- تحديد العلاقات (وراثة، تجميع، ارتباط، تبعية)
- تنظيم الحزم والمساحات
- إظهار الخصائص والطرق بوضوح
- استخدام مستويات الرؤية المناسبة (+, -, #, ~)`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط فئات لـ: {{title}}

الوصف: {{description}}
المتطلبات: {{requirements}}
مستوى التفصيل: {{complexity}}

تأكد من:
- إظهار الفئات الرئيسية مع خصائصها وطرقها
- تحديد العلاقات بوضوح (extends, implements, uses)
- استخدام مستويات الرؤية المناسبة
- تنظيم الفئات في مجموعات منطقية
- إضافة ملاحظات توضيحية عند الحاجة

ابدأ بـ @startuml وانته بـ @enduml`
        },
        context: {
            type: 'context',
            content: `السياق التقني:
{{#if projectContext}}
- المشروع: {{projectContext.title}}
- المجال: {{projectContext.domain}}
- التقنيات: {{projectContext.technologies}}
{{/if}}

{{#if stakeholders}}
أصحاب المصلحة: {{stakeholders}}
{{/if}}

{{#if constraints}}
القيود: {{constraints}}
{{/if}}`
        }
    },

    // مخطط التسلسل (Sequence Diagram)
    'sequence': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات التسلسل (Sequence Diagrams)
- تصميم تدفق الرسائل بين الكائنات
- إظهار التفاعلات الزمنية
- استخدام خطوط الحياة والتفعيل
- تمثيل الحلقات والشروط
- إدارة إنشاء وتدمير الكائنات`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط تسلسل لـ: {{title}}

السيناريو: {{description}}
الفاعلون: {{stakeholders}}
العمليات: {{requirements}}

تأكد من:
- إظهار جميع الفاعلين والكائنات المشاركة
- ترتيب الرسائل حسب التسلسل الزمني
- استخدام التفعيل للعمليات الطويلة
- إضافة الشروط والحلقات عند الحاجة
- وضع أرقام للرسائل للوضوح

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط حالات الاستخدام (Use Case Diagram)
    'usecase': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات حالات الاستخدام (Use Case Diagrams)
- تحديد الفاعلين الرئيسيين والثانويين
- تصميم حالات الاستخدام الأساسية والفرعية
- إظهار العلاقات (include, extend, generalization)
- تنظيم النظام في حدود واضحة
- ربط الفاعلين بحالات الاستخدام المناسبة`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط حالات الاستخدام لـ: {{title}}

النظام: {{description}}
المستخدمون: {{stakeholders}}
الوظائف: {{requirements}}

تأكد من:
- إظهار جميع الفاعلين (داخليين وخارجيين)
- تحديد حالات الاستخدام الرئيسية
- استخدام العلاقات المناسبة (include, extend)
- رسم حدود النظام بوضوح
- تجميع الوظائف المترابطة

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط الأنشطة (Activity Diagram)
    'activity': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات الأنشطة (Activity Diagrams)
- تصميم تدفق العمليات والأنشطة
- إظهار نقاط البداية والنهاية
- استخدام القرارات والتفرعات
- تمثيل الأنشطة المتوازية
- إدارة المسارات الاستثنائية`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط أنشطة لـ: {{title}}

العملية: {{description}}
الخطوات: {{requirements}}
المسؤولون: {{stakeholders}}

تأكد من:
- بداية ونهاية واضحة للعملية
- تسلسل منطقي للأنشطة
- إظهار نقاط القرار والتفرع
- استخدام المسارات المتوازية عند الحاجة
- معالجة الحالات الاستثنائية

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط المكونات (Component Diagram)
    'component': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات المكونات (Component Diagrams)
- تصميم المكونات والوحدات النمطية
- إظهار الواجهات والتبعيات
- تنظيم المكونات في حزم
- تمثيل الخدمات والموارد
- ربط المكونات بالبيئة الخارجية`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط مكونات لـ: {{title}}

النظام: {{description}}
المكونات: {{requirements}}
التقنيات: {{technologies}}

تأكد من:
- إظهار المكونات الرئيسية والفرعية
- تحديد الواجهات المطلوبة والمقدمة
- إظهار التبعيات بين المكونات
- تجميع المكونات المترابطة في حزم
- ربط المكونات بالأنظمة الخارجية

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط النشر (Deployment Diagram)
    'deployment': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات النشر (Deployment Diagrams)
- تصميم البنية التحتية والعقد
- إظهار توزيع المكونات على الأجهزة
- تمثيل الشبكات والاتصالات
- إدارة البيئات المختلفة
- تحديد البروتوكولات والمنافذ`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط نشر لـ: {{title}}

النظام: {{description}}
البيئات: {{environments}}
المكونات: {{requirements}}

تأكد من:
- إظهار العقد والأجهزة الرئيسية
- توزيع المكونات على العقد المناسبة
- إظهار الاتصالات والشبكات
- تحديد البروتوكولات المستخدمة
- تمييز البيئات المختلفة (تطوير، إنتاج)

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط الحالات (State Diagram)
    'state': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات الحالات (State Diagrams)
- تصميم حالات الكائن ودورة حياته
- إظهار الانتقالات والمحفزات
- استخدام الحالات المركبة والفرعية
- تمثيل الأحداث والشروط
- إدارة الحالات المتوازية`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط حالات لـ: {{title}}

الكائن: {{description}}
الحالات: {{requirements}}
الأحداث: {{events}}

تأكد من:
- إظهار الحالة الأولية والنهائية
- تحديد جميع الحالات الممكنة
- إظهار الانتقالات والمحفزات
- استخدام الحالات المركبة عند الحاجة
- تسمية الأحداث والشروط بوضوح

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط الكائنات (Object Diagram)
    'object': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات الكائنات (Object Diagrams)
- تصميم حالات محددة للكائنات
- إظهار القيم الفعلية للخصائص
- تمثيل الروابط بين الكائنات
- استخدام أسماء كائنات واقعية
- إظهار حالة النظام في لحظة معينة`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط كائنات لـ: {{title}}

السيناريو: {{description}}
الكائنات: {{requirements}}
البيانات: {{sampleData}}

تأكد من:
- استخدام أسماء كائنات واقعية
- إظهار القيم الفعلية للخصائص
- تمثيل الروابط بين الكائنات
- استخدام بيانات عينة منطقية
- إظهار حالة محددة للنظام

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط التواصل (Communication Diagram)
    'communication': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات التواصل (Communication Diagrams)
- تصميم التفاعلات بين الكائنات
- إظهار الرسائل والاستدعاءات
- تنظيم الكائنات مكانياً
- ترقيم الرسائل حسب التسلسل
- إظهار التعاون بين الكائنات`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط تواصل لـ: {{title}}

التفاعل: {{description}}
الكائنات: {{stakeholders}}
الرسائل: {{requirements}}

تأكد من:
- إظهار جميع الكائنات المشاركة
- ترقيم الرسائل حسب التسلسل
- إظهار اتجاه الرسائل بوضوح
- تنظيم الكائنات بشكل منطقي
- استخدام أسماء رسائل واضحة

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط التفاعل (Interaction Diagram)
    'interaction': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات التفاعل (Interaction Diagrams)
- تصميم التفاعلات المعقدة
- إظهار التسلسل والتوقيت
- استخدام الإطارات التفاعلية
- تمثيل الحلقات والشروط
- إدارة التفاعلات المتداخلة`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط تفاعل لـ: {{title}}

السيناريو: {{description}}
المشاركون: {{stakeholders}}
التفاعلات: {{requirements}}

تأكد من:
- إظهار التفاعلات بالتفصيل
- استخدام الإطارات التفاعلية
- تمثيل الشروط والحلقات
- إظهار التوقيت والتسلسل
- تنظيم التفاعلات المعقدة

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط التوقيت (Timing Diagram)
    'timing': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات التوقيت (Timing Diagrams)
- تصميم التغيرات الزمنية للحالات
- إظهار الخطوط الزمنية
- تمثيل القيود الزمنية
- استخدام المقاييس الزمنية
- إدارة الأحداث المتزامنة`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط توقيت لـ: {{title}}

العملية: {{description}}
الكائنات: {{stakeholders}}
الأحداث: {{requirements}}

تأكد من:
- إظهار الخطوط الزمنية للكائنات
- تمثيل تغيرات الحالة عبر الزمن
- استخدام مقياس زمني واضح
- إظهار القيود والمهل الزمنية
- تسمية الأحداث والحالات

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط التدفق (Flowchart)
    'flowchart': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات التدفق (Flowcharts)
- تصميم تدفق العمليات والقرارات
- استخدام الرموز المعيارية
- إظهار المسارات البديلة
- تنظيم التدفق بوضوح
- معالجة الحالات الاستثنائية`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط تدفق لـ: {{title}}

العملية: {{description}}
الخطوات: {{requirements}}
القرارات: {{decisions}}

تأكد من:
- بداية ونهاية واضحة
- استخدام الأشكال المعيارية
- إظهار نقاط القرار والتفرع
- تسمية الخطوات بوضوح
- معالجة المسارات الاستثنائية

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // الخريطة الذهنية (Mindmap)
    'mindmap': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: الخرائط الذهنية (Mindmaps)
- تصميم هياكل المعرفة والأفكار
- تنظيم المفاهيم هرمياً
- استخدام الألوان والرموز
- ربط الأفكار المترابطة
- إنشاء هياكل بصرية واضحة`
        },
        user: {
            type: 'user',
            content: `أنشئ خريطة ذهنية لـ: {{title}}

الموضوع الرئيسي: {{description}}
المفاهيم: {{requirements}}
الفئات: {{categories}}

تأكد من:
- وضع الفكرة المركزية في الوسط
- تنظيم الأفكار في فروع رئيسية
- استخدام ألوان مختلفة للتمييز
- ربط الأفكار المترابطة
- استخدام كلمات مفتاحية واضحة

ابدأ بـ @startmindmap وانته بـ @endmindmap`
        }
    },

    // مخطط جانت (Gantt Chart)
    'gantt': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات جانت (Gantt Charts)
- تصميم الجداول الزمنية للمشاريع
- إظهار المهام والمدد الزمنية
- تمثيل التبعيات بين المهام
- استخدام المعالم الزمنية
- إدارة الموارد والتقدم`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط جانت لـ: {{title}}

المشروع: {{description}}
المهام: {{requirements}}
المدة: {{duration}}

تأكد من:
- تحديد جميع المهام الرئيسية
- إظهار المدد الزمنية لكل مهمة
- تمثيل التبعيات بين المهام
- استخدام تواريخ واقعية
- إضافة المعالم المهمة

ابدأ بـ @startgantt وانته بـ @endgantt`
        }
    },

    // مخطط الشبكة (Network Diagram)
    'network': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات الشبكة (Network Diagrams)
- تصميم البنية الشبكية والاتصالات
- إظهار العقد والروابط
- تمثيل البروتوكولات والخدمات
- استخدام رموز الشبكة المعيارية
- إدارة الأمان والتكوين`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط شبكة لـ: {{title}}

الشبكة: {{description}}
العقد: {{requirements}}
البروتوكولات: {{protocols}}

تأكد من:
- إظهار جميع العقد والأجهزة
- تمثيل الاتصالات والروابط
- تحديد البروتوكولات المستخدمة
- إظهار عناوين IP والمنافذ
- تمييز مناطق الأمان

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // مخطط العلاقات (ER Diagram)
    'er': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: مخططات العلاقات (ER Diagrams)
- تصميم قواعد البيانات والكيانات
- إظهار العلاقات والقيود
- تحديد المفاتيح الأساسية والخارجية
- استخدام رموز ER المعيارية
- تطبيع البيانات وتحسين الهيكل`
        },
        user: {
            type: 'user',
            content: `أنشئ مخطط علاقات لـ: {{title}}

قاعدة البيانات: {{description}}
الكيانات: {{requirements}}
العلاقات: {{relationships}}

تأكد من:
- إظهار جميع الكيانات الرئيسية
- تحديد الخصائص والأنواع
- إظهار العلاقات والقيود
- تحديد المفاتيح الأساسية والخارجية
- استخدام رموز ER المعيارية

ابدأ بـ @startuml وانته بـ @enduml`
        }
    },

    // الإطار السلكي (Wireframe)
    'wireframe': {
        system: {
            type: 'system',
            content: `${SYSTEM_BASE_PROMPT}

تخصصك: الإطارات السلكية (Wireframes)
- تصميم واجهات المستخدم الأولية
- إظهار تخطيط الصفحات والعناصر
- تمثيل التنقل والتفاعل
- استخدام عناصر UI المعيارية
- التركيز على الوظيفة وليس التصميم`
        },
        user: {
            type: 'user',
            content: `أنشئ إطار سلكي لـ: {{title}}

الواجهة: {{description}}
العناصر: {{requirements}}
الوظائف: {{functions}}

تأكد من:
- إظهار تخطيط الصفحة الأساسي
- تحديد مواقع العناصر الرئيسية
- إظهار التنقل والقوائم
- استخدام عناصر UI معيارية
- التركيز على الوظيفة وليس الجمال

ابدأ بـ @startsalt وانته بـ @endsalt`
        }
    }
};

/**
 * برومبتات الجودة والتحسين
 */
export const QUALITY_PROMPTS = {
    validation: {
        type: 'quality' as DiagramPromptType,
        content: `قم بتقييم جودة المخطط التالي:

{{diagramCode}}

معايير التقييم:
1. صحة البناء والتركيب
2. وضوح العناصر والعلاقات
3. اكتمال المعلومات المطلوبة
4. تنظيم وترتيب العناصر
5. استخدام أفضل الممارسات

أعط تقييماً من 100 ونقاط للتحسين.`
    },

    improvement: {
        type: 'improvement' as DiagramPromptType,
        content: `حسن المخطط التالي بناءً على هذه النقاط:

المخطط الحالي:
{{currentDiagram}}

نقاط التحسين:
{{improvementPoints}}

معايير الجودة المطلوبة:
- نقاط الجودة: {{qualityThreshold}}
- مستوى التفصيل: {{complexity}}
- التركيز على: {{focusAreas}}

أنشئ نسخة محسنة مع شرح التحسينات.`
    }
};

/**
 * برومبتات السياق
 */
export const CONTEXT_PROMPTS = {
    projectContext: {
        type: 'context' as DiagramPromptType,
        content: `معلومات المشروع:
{{#if projectContext}}
- اسم المشروع: {{projectContext.title}}
- الوصف: {{projectContext.description}}
- المجال: {{projectContext.domain}}
- التقنيات المستخدمة: {{#each projectContext.technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

{{#if stakeholders}}
أصحاب المصلحة:
{{#each stakeholders}}
- {{this}}
{{/each}}
{{/if}}

{{#if requirements}}
المتطلبات:
{{#each requirements}}
- {{this}}
{{/each}}
{{/if}}`
    },

    styleContext: {
        type: 'context' as DiagramPromptType,
        content: `إعدادات التصميم:
- الثيم: {{style.theme}}
- الاتجاه: {{style.direction}}
- إظهار التفاصيل: {{#if style.showDetails}}نعم{{else}}لا{{/if}}
- تضمين الملاحظات: {{#if style.includeNotes}}نعم{{else}}لا{{/if}}
- مستوى التعقيد: {{complexity}}
- اللغة: {{#if language}}{{language}}{{else}}العربية{{/if}}`
    }
};

/**
 * فئة بناء برومبتات المخططات الذكية
 */
export class DiagramPromptBuilder extends IntelligentPromptBuilder {
    /**
     * بناء برومبت مخصص للمخطط
     */
    async buildDiagramPrompt(options: {
        diagramType: DiagramType;
        title: string;
        description?: string;
        complexity: DiagramComplexity;
        style?: DiagramStyle;
        projectContext?: any;
        requirements?: string[];
        stakeholders?: string[];
        contextAnalysis?: any;
        language?: 'ar' | 'en';
    }): Promise<string> {
        const { diagramType, contextAnalysis } = options;

        // الحصول على قالب البرومبت للنوع المحدد
        const promptTemplate = DIAGRAM_PROMPT_TEMPLATES[diagramType];
        if (!promptTemplate) {
            throw new Error(`Unsupported diagram type: ${diagramType}`);
        }

        // بناء البرومبت الأساسي
        let prompt = promptTemplate.system.content + '\n\n';

        // إضافة السياق إذا كان متوفراً
        if (promptTemplate.context && options.projectContext) {
            const contextPrompt = this.processTemplate(
                promptTemplate.context.content,
                options
            );
            prompt += contextPrompt + '\n\n';
        }

        // إضافة برومبت المستخدم
        const userPrompt = this.processTemplate(
            promptTemplate.user.content,
            options
        );
        prompt += userPrompt;

        // إضافة إرشادات خاصة بالتعقيد
        prompt += this.getComplexityGuidelines(diagramType, options.complexity);

        // إضافة إرشادات التصميم
        if (options.style) {
            prompt += this.getStyleGuidelines(options.style);
        }

        // تحسين البرومبت باستخدام تحليل السياق
        if (contextAnalysis && options.projectContext) {
            prompt = await this.enhancePromptWithContext(prompt, contextAnalysis);
        }

        return prompt;
    }

    /**
     * معالجة قالب البرومبت
     */
    private processTemplate(template: string, variables: any): string {
        let processed = template;

        // استبدال المتغيرات البسيطة
        Object.keys(variables).forEach(key => {
            const value = variables[key];
            if (typeof value === 'string') {
                processed = processed.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    value
                );
            }
        });

        // معالجة القوائم
        if (variables.requirements && Array.isArray(variables.requirements)) {
            processed = processed.replace(
                '{{requirements}}',
                variables.requirements.join('\n- ')
            );
        }

        if (variables.stakeholders && Array.isArray(variables.stakeholders)) {
            processed = processed.replace(
                '{{stakeholders}}',
                variables.stakeholders.join('\n- ')
            );
        }

        if (variables.technologies && Array.isArray(variables.technologies)) {
            processed = processed.replace(
                '{{technologies}}',
                variables.technologies.join(', ')
            );
        }

        return processed;
    }

    /**
     * الحصول على إرشادات التعقيد
     */
    private getComplexityGuidelines(type: DiagramType, complexity: DiagramComplexity): string {
        const guidelines: Record<DiagramComplexity, string> = {
            basic: 'ركز على العناصر الأساسية والهيكل العام فقط.',
            detailed: 'أضف تفاصيل متوسطة مع العلاقات والخصائص المهمة.',
            comprehensive: 'اعرض جميع التفاصيل والعلاقات والخصائص بشكل كامل.'
        };

        return `\n\nمستوى التفصيل (${complexity}): ${guidelines[complexity]}`;
    }

    /**
     * الحصول على إرشادات التصميم
     */
    private getStyleGuidelines(style: DiagramStyle): string {
        let guidelines = '\n\nإرشادات التصميم:\n';

        // إرشادات الثيم
        const themeGuidelines: Record<DiagramStyle['theme'], string> = {
            default: 'استخدم التصميم الافتراضي البسيط',
            modern: 'استخدم ألوان حديثة وتصميم عصري',
            minimal: 'اجعل التصميم بسيطاً ونظيفاً',
            colorful: 'استخدم ألوان متنوعة ومميزة'
        };
        guidelines += `- الثيم: ${themeGuidelines[style.theme]}\n`;

        // إرشادات الاتجاه
        const directionGuidelines: Record<DiagramStyle['direction'], string> = {
            'top-bottom': 'رتب العناصر من الأعلى للأسفل',
            'left-right': 'رتب العناصر من اليسار لليمين',
            'bottom-top': 'رتب العناصر من الأسفل للأعلى',
            'right-left': 'رتب العناصر من اليمين لليسار'
        };
        guidelines += `- الاتجاه: ${directionGuidelines[style.direction]}\n`;

        // إرشادات التفاصيل
        guidelines += `- التفاصيل: ${style.showDetails ? 'اعرض جميع التفاصيل' : 'اعرض المعلومات الأساسية فقط'}\n`;
        guidelines += `- الملاحظات: ${style.includeNotes ? 'أضف ملاحظات توضيحية' : 'لا تضف ملاحظات'}`;

        return guidelines;
    }

    /**
     * تحسين البرومبت باستخدام تحليل السياق
     */
    private async enhancePromptWithContext(prompt: string, contextAnalysis: any): Promise<string> {
        let enhanced = prompt;

        // إضافة معلومات السياق المكتشفة
        if (contextAnalysis.keyEntities && contextAnalysis.keyEntities.length > 0) {
            enhanced += `\n\nالكيانات المكتشفة: ${contextAnalysis.keyEntities.join(', ')}`;
        }

        if (contextAnalysis.relationships && contextAnalysis.relationships.length > 0) {
            enhanced += `\nالعلاقات المكتشفة: ${contextAnalysis.relationships.join(', ')}`;
        }

        // اقتراح أنواع مخططات إضافية
        if (contextAnalysis.suggestedDiagramTypes && contextAnalysis.suggestedDiagramTypes.length > 1) {
            enhanced += `\n\nملاحظة: يمكن أيضاً استخدام هذه الأنواع: ${contextAnalysis.suggestedDiagramTypes.slice(1).join(', ')}`;
        }

        return enhanced;
    }

    /**
     * بناء برومبت التحسين
     */
    buildImprovementPrompt(options: {
        currentDiagram: string;
        qualityAssessment: any;
        targetQuality: number;
        focusAreas?: string[];
    }): string {
        const { currentDiagram, qualityAssessment, targetQuality, focusAreas } = options;

        let prompt = QUALITY_PROMPTS.improvement.content;

        prompt = prompt.replace('{{currentDiagram}}', currentDiagram);
        prompt = prompt.replace('{{improvementPoints}}', qualityAssessment.issues.join('\n- '));
        prompt = prompt.replace('{{qualityThreshold}}', targetQuality.toString());

        if (focusAreas && focusAreas.length > 0) {
            prompt = prompt.replace('{{focusAreas}}', focusAreas.join(', '));
        } else {
            prompt = prompt.replace('{{focusAreas}}', 'التحسين العام');
        }

        return prompt;
    }

    /**
     * بناء برومبت التحقق من الجودة
     */
    buildValidationPrompt(diagramCode: string): string {
        return QUALITY_PROMPTS.validation.content.replace('{{diagramCode}}', diagramCode);
    }
}

// تصدير مثيل افتراضي
export const diagramPromptBuilder = new DiagramPromptBuilder();
